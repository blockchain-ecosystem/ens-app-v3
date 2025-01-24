import { Address } from 'viem'
import { useChainId, useReadContract } from 'wagmi'

import { useAddressRecord } from './ensjs/public/useAddressRecord'

const ORACLE_ENS = 'eth-usd.data.pik'

const ORACLE_CUSTOM = process.env.NEXT_PUBLIC_CONTRACT_DUMMY_ORACLE as `0x${string}`

export const useEthPrice = () => {
  const chainId: any = useChainId()
  const { data: address_ } = useAddressRecord({
    name: ORACLE_ENS,
  })

  const address = chainId === 398 ? ORACLE_CUSTOM : (address_?.value as Address) || undefined

  return useReadContract({
    abi: [
      {
        inputs: [],
        name: 'latestAnswer',
        outputs: [{ name: '', type: 'int256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address,
    functionName: 'latestAnswer',
  })
}
