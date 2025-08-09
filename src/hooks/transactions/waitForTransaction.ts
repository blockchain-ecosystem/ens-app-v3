import type {
  CallParameters,
  EIP1193Parameters,
  EIP1193RequestFn,
  Hash,
  PublicRpcSchema,
  ReplacementReason,
  WaitForTransactionReceiptReturnType,
} from 'viem'
import { hexToString } from 'viem'
import { call, getTransaction, waitForTransactionReceipt } from 'viem/actions'

import { ConfigWithEns } from '@app/types'
import { fetchTxFromSafeTxHash } from '@app/utils/safe'

export type WaitForTransactionArgs = {
  /** Chain id to use for Public Client. */
  chainId?: ConfigWithEns['state']['chainId']
  /**
   * Number of blocks to wait for after transaction is mined
   * @default 1
   */
  confirmations?: number
  /** Transaction hash to monitor */
  hash: Hash
  /** Callback to invoke when the transaction has been replaced (sped up). */
  onReplaced?: (response: { reason: ReplacementReason; transactionHash: Hash }) => void
  /*
   * Maximum amount of time to wait before timing out in milliseconds
   * @default 0
   */
  timeout?: number
  isSafeTx?: boolean
}

export type WaitForTransactionResult = WaitForTransactionReceiptReturnType

type RequestParameters = EIP1193Parameters<PublicRpcSchema>
type RequestReturnType = Extract<
  PublicRpcSchema[number],
  { Method: RequestParameters['method'] }
>['ReturnType']
export async function requestWithSafeOverride(
  client: ReturnType<ConfigWithEns['getClient']>,
  args: RequestParameters,
): Promise<RequestReturnType> {
  if (args.method === 'eth_getTransactionReceipt' || args.method === 'eth_getTransactionByHash') {
    const {
      params: [hash],
    } = args
    const realTxData = await fetchTxFromSafeTxHash({
      chainId: client.chain!.id,
      safeTxHash: hash,
    })
    return client.request({
      method: args.method,
      // fallback to existing hash, since if executing straight away on a 1/1 safe the tx hash returned
      // is actually the real tx hash
      params: [realTxData?.transactionHash ?? hash],
    })
  }

  return client.request(args)
}

export async function waitForTransaction(
  config: ConfigWithEns,
  { chainId, confirmations = 1, hash, onReplaced, timeout = 0, isSafeTx }: WaitForTransactionArgs,
): Promise<WaitForTransactionResult> {
  const initialClient = config.getClient({ chainId })
  let client = { ...initialClient }

  if (isSafeTx) {
    client = {
      ...client,
      request: ((args: RequestParameters) =>
        requestWithSafeOverride(initialClient, args)) as EIP1193RequestFn<PublicRpcSchema>,
    }
  }

  const receipt = await waitForTransactionReceipt(client, {
    hash,
    confirmations,
    onReplaced: ({ reason, transaction }) =>
      onReplaced?.({ reason, transactionHash: transaction.hash }),
    timeout,
  })
  if (receipt.status === 'reverted') {
    const txn = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    // Gọi eth_call an toàn để lấy lý do revert
    try {
      const code = (await call(client, {
        to: txn.to!,
        data: (txn as any).input ?? (txn as any).data, // client có thể trả 'input'
        from: txn.from as any,
        gas: txn.gas,
        // nhiều RPC custom đòi 'latest'
        blockTag: 'latest',
        // thử giữ nguyên value trước
        value: txn.value,
        gasPrice: txn.type !== 'eip1559' ? txn.gasPrice : undefined,
        maxFeePerGas: txn.type === 'eip1559' ? txn.maxFeePerGas : undefined,
        maxPriorityFeePerGas: txn.type === 'eip1559' ? txn.maxPriorityFeePerGas : undefined,
      } as CallParameters)) as unknown as string
      const reason = hexToString(`0x${code.substring(138)}`)
      throw new Error(reason)
    } catch (e1) {
      // Fallback: đặt value=0 để tránh RPC check số dư
      try {
        const code = (await call(client, {
          to: txn.to!,
          data: (txn as any).input ?? (txn as any).data,
          from: txn.from as any,
          gas: txn.gas,
          blockTag: 'latest',
          value: undefined,
          gasPrice: txn.type !== 'eip1559' ? txn.gasPrice : undefined,
          maxFeePerGas: txn.type === 'eip1559' ? txn.maxFeePerGas : undefined,
          maxPriorityFeePerGas: txn.type === 'eip1559' ? txn.maxPriorityFeePerGas : undefined,
        } as CallParameters)) as unknown as string
        const reason = hexToString(`0x${code.substring(138)}`)
        throw new Error(reason)
      } catch {
        // Cuối cùng: không trích được lý do rõ ràng
        throw new Error('transaction reverted')
      }
    }
  } else if (isSafeTx) {
    onReplaced?.({
      reason: 'repriced',
      transactionHash: receipt.transactionHash,
    })
  }
  return receipt
}
