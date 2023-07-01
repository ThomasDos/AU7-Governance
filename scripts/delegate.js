const { ethers } = require('hardhat')
const CONTRACT_ADDRESSES = require('./CONTRACT_ADDRESSES')

async function main() {
  const [owner] = await ethers.getSigners()

  const zouzouToken = await ethers.getContractAt('ZouzouToken', CONTRACT_ADDRESSES.ZOUZOUTOKEN_ADDRESS)

  const tx = await zouzouToken.delegate(owner.address)
  await tx.wait()
  console.log('tx', tx)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
