const { ethers } = require('hardhat')
const { GOVERNOR_ADDRESS } = require('./CONTRACT_ADDRESSES')

//Proposal ID :

const proposalId = BigInt('65904260243197985366460435441428537461215291080940599991762826568561215172386')
async function proposalState() {
  const governor = await ethers.getContractAt('MyGovernor', GOVERNOR_ADDRESS)

  const proposal = await governor.state(proposalId)
  console.log(proposal)
}

proposalState().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
