const { ethers } = require('hardhat')

async function main() {
  const [owner] = await ethers.getSigners()

  const transactionCount = await owner.getTransactionCount()

  // gets the address of the token before it is deployed
  const futureAddress = ethers.utils.getContractAddress({
    from: owner.address,
    nonce: transactionCount + 1
  })

  const MyGovernor = await ethers.getContractFactory('MyGovernor')
  const governor = await MyGovernor.deploy(futureAddress)

  const MyToken = await ethers.getContractFactory('ZouzouToken')
  const token = await MyToken.deploy(governor.address)

  console.log(`Governor deployed to ${governor.address}`, `Token deployed to ${token.address}`)
}

// Governor address : 0xc36FFf14198BC269D2316CcDDEAD60D5c763DBB8
// ZouzouToken address : 0xE353Cf5865932B3Fdb1C506fB478fa2b9674f142

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
