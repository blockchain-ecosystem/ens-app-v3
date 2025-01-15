/* eslint-disable import/no-extraneous-dependencies */
import { existsSync, mkdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import hre from 'hardhat'
import { resolve } from 'path'

const func: DeployFunction = async function (hre: any) {
  const { getNamedAccounts } = hre
  const { deployer } = await getNamedAccounts()

  let contractJson: any

  const jsonPath = resolve(__dirname, '../node_modules/.cache/multicall.json')

  if (!existsSync(resolve(jsonPath, '../'))) mkdirSync(resolve(jsonPath, '../'))

  if (existsSync(jsonPath)) {
    console.log('Multicall JSON file found, using it...')
    contractJson = JSON.parse(await readFile(jsonPath, { encoding: 'utf8' }))
  } else {
    console.log('Downloading Multicall JSON file...')
    contractJson = await fetch(
      'https://github.com/mds1/multicall/releases/latest/download/Multicall3.json',
    ).then((res) => res.json())
    await writeFile(jsonPath, JSON.stringify(contractJson))
    console.log('Wrote Multicall JSON file to', jsonPath)
  }

  const rs = await hre.deployments.deploy('Multicall', {
    from: deployer,
    contract: contractJson,
  })
  console.log('Multicall deployed at', rs)
  return true
}
func.id = 'multicall'
func.tags = ['multicall']

export default func
