import { defineChain } from 'viem'

export const custom = /* #__PURE__ */ defineChain({
  id: Number(process.env.NEXT_PUBLIC_CUSTOM_NETWORK_CHAIN_ID!),
  name: process.env.NEXT_PUBLIC_CUSTOM_NETWORK_NAME!,
  nativeCurrency: { name: process.env.NEXT_PUBLIC_CUSTOM_NETWORK_NATIVE_CURRENCY_NAME!, symbol: process.env.NEXT_PUBLIC_CUSTOM_NETWORK_NATIVE_CURRENCY_SYMBOL!, decimals: Number(process.env.NEXT_PUBLIC_CUSTOM_NETWORK_NATIVE_CURRENCY_DECIMALS!) },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_CUSTOM_NETWORK_RPC?.startsWith('http')
          ? process.env.NEXT_PUBLIC_CUSTOM_NETWORK_RPC
          : `http://${process.env.NEXT_PUBLIC_CUSTOM_NETWORK_RPC}`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: process.env.NEXT_PUBLIC_CUSTOM_NETWORK_EXPLORER || '',
      apiUrl: process.env.NEXT_PUBLIC_CUSTOM_NETWORK_API_URL,
    },
  },
  contracts: {
    multicall3: {
      address: process.env.NEXT_PUBLIC_CONTRACT_MULTICALL as `0x${string}`,
      blockCreated: Number(process.env.NEXT_PUBLIC_CONTRACT_MULTICALL_BLOCK_CREATED) || 1,
    },
    ensBaseRegistrarImplementation: {
      address: process.env.NEXT_PUBLIC_CONTRACT_BASE_REGISTRAR_IMPLEMENTATION as `0x${string}`,
    },
    ensBulkRenewal: {
      address: process.env.NEXT_PUBLIC_CONTRACT_BULK_RENEWAL as `0x${string}`,
    },
    ensDnsRegistrar: {
      address: process.env.NEXT_PUBLIC_CONTRACT_DNS_REGISTRAR as `0x${string}`,
    },
    ensDnssecImpl: {
      address: process.env.NEXT_PUBLIC_CONTRACT_DNSSEC_IMPL as `0x${string}`,
    },
    ensEthRegistrarController: {
      address: process.env.NEXT_PUBLIC_CONTRACT_ETH_REGISTRAR_CONTROLLER as `0x${string}`,
    },
    ensNameWrapper: {
      address: process.env.NEXT_PUBLIC_CONTRACT_NAME_WRAPPER as `0x${string}`,
    },
    ensPublicResolver: {
      address: process.env.NEXT_PUBLIC_CONTRACT_PUBLIC_RESOLVER as `0x${string}`,
    },
    ensRegistry: {
      address: process.env.NEXT_PUBLIC_CONTRACT_REGISTRY as `0x${string}`,
    },
    ensReverseRegistrar: {
      address: process.env.NEXT_PUBLIC_CONTRACT_REVERSE_REGISTRAR as `0x${string}`,
    },
    ensUniversalResolver: {
      address: process.env.NEXT_PUBLIC_CONTRACT_UNIVERSAL_RESOLVER as `0x${string}`,
    },
    legacyEthRegistrarController: {
      address: process.env.NEXT_PUBLIC_CONTRACT_LEGACY_ETH_REGISTRAR_CONTROLLER as `0x${string}`,
    },
    legacyPublicResolver: {
      address: process.env.NEXT_PUBLIC_CONTRACT_LEGACY_PUBLIC_RESOLVER as `0x${string}`,
    },
  },
  avatar: {
    baseUrl:
      process.env.NEXT_PUBLIC_AVUP_ENDPOINT || 'https://avatar-upload.teknix5947.workers.dev',
  },
})
