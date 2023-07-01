const { ethers } = require('hardhat')
const { ZOUZOUTOKEN_ADDRESS } = require('./CONTRACT_ADDRESSES')

async function balanceOf() {
  const [owner] = await ethers.getSigners()

  const zouzouToken = await ethers.getContractAt('ZouzouToken', ZOUZOUTOKEN_ADDRESS)

  const balance = await zouzouToken.balanceOf(owner.address)
  console.log(balance.toString())
}

balanceOf().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
