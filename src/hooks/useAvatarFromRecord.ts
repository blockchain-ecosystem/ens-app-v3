import { useEffect, useState } from 'react'

import { getProtocolType } from '@ensdomains/ensjs/utils'

const SUPPORTED_PROTOCOL_REGEX = /^(http|https|ar|ipfs|eip155):/

// const chainIdToNetwork = (chainId?: string) => {
//   if (chainId === '1') return 'mainnet'
//   if (chainId === '5') return 'goerli'
//   if (chainId === '11155111') return 'sepolia'
//   return ''
// }

// const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY || 'no-key'
const makeApiURL = (originalAddress: string) => {
  const cleanAddress = originalAddress.replace('-', '')
  const match = cleanAddress.match(/^eip155:(\d+)\/(erc1155|erc721):(.*)\/(.*)$/)
  // const chainId = match?.[1]
  const tokenType = match?.[2]
  const contractAddress = match?.[3]
  const tokenId = match?.[4]
  // const network = chainIdToNetwork(chainId)
  if (tokenType && contractAddress && tokenId)
    return `${process.env.NEXT_PUBLIC_CUSTOM_NETWORK_API_URL}/api/v2/tokens/${contractAddress}/instances/${tokenId}`
  return undefined
}

const getAvatarSrc = async (record: string) => {
  try {
    const protocol = record.match(SUPPORTED_PROTOCOL_REGEX)?.[1]
    if (!protocol) return

    if (protocol === 'ipfs') {
      const { decoded } = getProtocolType(record)!
      return `https://cloudflare-ipfs.com/ipfs/${decoded}`
    }

    if (protocol === 'ar') {
      const { decoded } = getProtocolType(record)!
      return `https://arweave.net/${decoded}`
    }

    if (protocol === 'eip155') {
      const apiUrl = makeApiURL(record)
      if (!apiUrl) return
      const resp = await fetch(apiUrl, {
        method: 'GET',
        redirect: 'follow',
      }).then((res) => res.json())
      return (resp as any)?.image_url || (resp as any)?.metadata?.image
    }

    return record
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export const useAvatarFromRecord = (avatarRecord?: string) => {
  useEffect(() => {
    console.log('useAvatarFromRecord mounted with record:', avatarRecord)
    return () => {
      console.log('useAvatarFromRecord unmounted')
    }
  }, [avatarRecord])

  useEffect(() => {
    console.log('avatarRecord changed:', avatarRecord)
  }, [avatarRecord])

  const [avatar, setAvatar] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('useEffect in useAvatarFromRecord triggered with record:', avatarRecord)
    let mounted = true
    if (avatarRecord) {
      console.log('Starting to fetch avatar for record:', avatarRecord)
      getAvatarSrc(avatarRecord)
        .then((_avatar) => {
          console.log('Avatar fetch result:', _avatar)
          if (mounted) setAvatar(_avatar)
        })
        .catch((error) => {
          console.error('Error fetching avatar:', error)
        })
        .finally(() => {
          if (mounted) setIsLoading(false)
        })
    } else {
      console.log('No avatar record provided')
      setIsLoading(false)
    }
    return () => {
      mounted = false
    }
  }, [avatarRecord])

  return {
    avatar,
    isLoading,
  }
}
