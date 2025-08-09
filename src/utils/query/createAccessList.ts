import { Address, BlockTag, Hex, TransactionRequest, type Client } from 'viem'

type AccessListResponse = {
  accessList: {
    address: Address
    storageKeys: Hex[]
  }[]
  gasUsed: Hex
}

export const createAccessList = async (
  client: Client,
  tx: TransactionRequest<Hex> & {
    blockTag?: BlockTag
  },
): Promise<AccessListResponse> => {
  const blockTag = tx.blockTag ?? 'pending'
  try {
    const accessListResponse = await client.request<{
      Method: 'eth_createAccessList'
      Parameters: [tx: TransactionRequest<Hex>, blockTag: BlockTag]
      ReturnType: AccessListResponse
    }>({
      method: 'eth_createAccessList',
      params: [{ to: tx.to, data: tx.data, from: tx.from, value: tx.value }, blockTag],
    })
    return accessListResponse
  } catch (e1) {
    try {
      const accessListResponse = await client.request<{
        Method: 'eth_createAccessList'
        Parameters: [tx: TransactionRequest<Hex>, blockTag: BlockTag]
        ReturnType: AccessListResponse
      }>({
        method: 'eth_createAccessList',
        params: [{ to: tx.to, data: tx.data, from: tx.from, value: '0x0' }, 'latest'],
      })
      return accessListResponse
    } catch (e2) {
      console.warn('[EST] createAccessList fallback to empty', e2)
      return { accessList: [], gasUsed: '0x0' as Hex }
    }
  }
}
