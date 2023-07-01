const { ethers } = require('hardhat')
const { GOVERNOR_ADDRESS } = require('./CONTRACT_ADDRESSES')

const proposalId = BigInt('65904260243197985366460435441428537461215291080940599991762826568561215172386')

async function castVote() {
  const governor = await ethers.getContractAt('MyGovernor', GOVERNOR_ADDRESS)

  const tx = await governor.castVote(proposalId, 1)
  await tx.wait()
  console.log('tx', tx)
}

castVote().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
