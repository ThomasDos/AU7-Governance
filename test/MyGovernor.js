const { mine, loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { assert } = require('chai')
const { ethers } = require('hardhat')
const { toUtf8Bytes, keccak256, parseEther } = ethers.utils

describe('MyGovernor', function () {
  async function deployFixture() {
    const [owner, secondAccount, thirdAccount] = await ethers.getSigners()

    const transactionCount = await owner.getTransactionCount()

    // gets the address of the zouzouToken before it is deployed
    const futureAddress = ethers.utils.getContractAddress({
      from: owner.address,
      nonce: transactionCount + 1
    })

    const MyGovernor = await ethers.getContractFactory('MyGovernor')
    const governor = await MyGovernor.deploy(futureAddress)

    const ZouzouToken = await ethers.getContractFactory('ZouzouToken')
    const zouzouToken = await ZouzouToken.deploy(governor.address)
    await zouzouToken.delegate(owner.address)

    await zouzouToken.transfer(secondAccount.address, parseEther('1000'))
    await zouzouToken.transfer(thirdAccount.address, parseEther('1000'))

    await zouzouToken.connect(secondAccount).delegate(secondAccount.address)
    await zouzouToken.connect(thirdAccount).delegate(thirdAccount.address)

    return { governor, zouzouToken, owner, secondAccount, thirdAccount }
  }

  it('should provide the owner with a starting balance', async () => {
    const { zouzouToken, owner, secondAccount, thirdAccount } = await loadFixture(deployFixture)

    const balance = await zouzouToken.balanceOf(owner.address)
    assert.equal(balance.toString(), parseEther('8000'))
    const balanceSecond = await zouzouToken.balanceOf(secondAccount.address)
    assert.equal(balanceSecond.toString(), parseEther('1000'))
    const balanceThird = await zouzouToken.balanceOf(thirdAccount.address)
    assert.equal(balanceThird.toString(), parseEther('1000'))
  })

  describe('after proposing', () => {
    async function afterProposingFixture() {
      const deployValues = await loadFixture(deployFixture)
      const { governor, zouzouToken, owner, secondAccount } = deployValues

      const tx = await governor.propose(
        [zouzouToken.address],
        [0],
        [zouzouToken.interface.encodeFunctionData('mint', [owner.address, parseEther('25000')])],
        'Give the owner more tokens!'
      )
      const receipt = await tx.wait()
      const event = receipt.events.find((x) => x.event === 'ProposalCreated')
      const { proposalId } = event.args

      const tx2 = await governor.propose(
        [zouzouToken.address],
        [0],
        [zouzouToken.interface.encodeFunctionData('mint', [secondAccount.address, parseEther('5000')])],
        'Second account wants 5000 more!'
      )
      const receipt2 = await tx2.wait()
      const event2 = receipt2.events.find((x) => x.event === 'ProposalCreated')
      const { proposalId: secondProposalId } = event2.args

      await mine(1)
      return { ...deployValues, proposalId, secondProposalId }
    }

    it('should set the initial state of the proposal', async () => {
      const { governor, proposalId } = await loadFixture(afterProposingFixture)

      const state = await governor.state(proposalId)
      assert.equal(state, 0)
      await mine(5)
      const stateAfterMined = await governor.state(proposalId)
      assert.equal(stateAfterMined, 1)
    })

    describe('after voting', () => {
      async function afterVotingFixture() {
        const proposingValues = await loadFixture(afterProposingFixture)
        await mine(10)
        const { governor, proposalId, secondAccount, thirdAccount } = proposingValues

        const tx = await governor.castVote(proposalId, 1)
        const receipt = await tx.wait()
        const voteCastEvent = receipt.events.find((x) => x.event === 'VoteCast')

        const tx2 = await governor.connect(secondAccount).castVote(proposalId, 0)
        const receipt2 = await tx2.wait()
        const voteCastEvent2 = receipt2.events.find((x) => x.event === 'VoteCast')
        const tx3 = await governor.connect(thirdAccount).castVote(proposalId, 0)
        const receipt3 = await tx3.wait()
        const voteCastEvent3 = receipt3.events.find((x) => x.event === 'VoteCast')

        return { ...proposingValues, voteCastEvent, voteCastEvent2, voteCastEvent3 }
      }

      it('should have set the vote', async () => {
        const { voteCastEvent, owner, voteCastEvent2, secondAccount } = await loadFixture(afterVotingFixture)

        assert.equal(voteCastEvent.args.voter, owner.address)
        assert.equal(voteCastEvent.args.weight.toString(), parseEther('8000').toString())
        assert.equal(voteCastEvent2.args.voter, secondAccount.address)
      })

      it('should allow executing the proposal', async () => {
        const { governor, zouzouToken, owner } = await loadFixture(afterVotingFixture)
        await mine(50)
        await governor.execute(
          [zouzouToken.address],
          [0],
          [zouzouToken.interface.encodeFunctionData('mint', [owner.address, parseEther('25000')])],
          keccak256(toUtf8Bytes('Give the owner more tokens!'))
        )

        const balance = await zouzouToken.balanceOf(owner.address)
        assert.equal(balance.toString(), parseEther('33000').toString())
      })
    })
  })
})
