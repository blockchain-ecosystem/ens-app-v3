import { useMemo } from 'react'
import { useChainId, useConfig } from 'wagmi'
import { createSubgraphClient } from '@ensdomains/ensjs/subgraph'

export const useSubgraphClient = () => {
  const config = useConfig()
  const client = config.getClient()
  const chainId = useChainId()
  return useMemo(() => createSubgraphClient({ client }), [client, chainId])
}
