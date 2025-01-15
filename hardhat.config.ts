/* eslint-disable import/no-extraneous-dependencies */
import '@nomiclabs/hardhat-ethers'
import 'dotenv/config'
import 'hardhat-deploy'

import { resolve } from 'path'

import { HardhatUserConfig } from 'hardhat/config'

const ensContractsPath = './node_modules/@ensdomains/ens-contracts'

console.log(resolve(ensContractsPath, 'artifacts'))
const DEPLOYER_KEY = process.env.DEPLOYER_KEY || '';
const OWNER_KEY = process.env.OWNER_KEY || '';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.13',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: 'localhost',
  networks: {
    
    custom: {
      saveDeployments: false,
      url: process.env.NEXT_PUBLIC_CUSTOM_NETWORK_RPC,
      chainId: 398,
      accounts: [`0x${DEPLOYER_KEY}`, `0x${OWNER_KEY}`],
      live: false,
      tags: ['legacy', 'use_root'],
    },
  },
  // namedAccounts: {
  //   deployer: {
  //     default: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //   },
  // },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 1,
    },
    owner2: {
      default: 1,
    },
  },
  external: {
    contracts: [
      {
        artifacts: [
          resolve(ensContractsPath, 'artifacts'),
          resolve(ensContractsPath, './deployments/archive'),
        ],
        deploy: resolve(ensContractsPath, './build/deploy'),
      },
    ],
  },
}

export default config
