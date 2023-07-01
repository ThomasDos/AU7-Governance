const { ethers } = require('hardhat')
const { GOVERNOR_ADDRESS, ZOUZOUTOKEN_ADDRESS } = require('./CONTRACT_ADDRESSES')

async function executeVote() {
  const [owner] = await ethers.getSigners()
  const governor = await ethers.getContractAt('MyGovernor', GOVERNOR_ADDRESS)
  const zouzouToken = await ethers.getContractAt('ZouzouToken', ZOUZOUTOKEN_ADDRESS)
  const tx = await governor.execute(
    [zouzouToken.address],
    [0],
    [zouzouToken.interface.encodeFunctionData('mint', [owner.address, ethers.utils.parseEther('25000')])],
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Give the owner more tokens!'))
  )
  await tx.wait()
  console.log('tx', tx)
}
