const { ethers } = require('hardhat')
const { ZOUZOUTOKEN_ADDRESS, GOVERNOR_ADDRESS } = require('./CONTRACT_ADDRESSES')

async function proposeVote() {
  const [owner] = await ethers.getSigners()

  const zouzouToken = await ethers.getContractAt('ZouzouToken', ZOUZOUTOKEN_ADDRESS)
  const governor = await ethers.getContractAt('MyGovernor', GOVERNOR_ADDRESS)

  const tx = await governor.propose(
    [zouzouToken.address],
    ['0'],
    [zouzouToken.interface.encodeFunctionData('mint', [owner.address, ethers.utils.parseEther('25000')])],
    'Give the owner more tokens!'
  )
  const receipt = await tx.wait()
  const event = receipt.events.find((x) => x.event === 'ProposalCreated')
  const { proposalId } = event.args
  console.log('proposalId', proposalId)
}

proposeVote().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
