
const { ethers } = require("hardhat");
const { utils} = require("ethers");

async function main() {

  //get singers
  [owner, user1, user2, user3] = await ethers.getSigners()

  // We get the contract to deploy
  this.CollectionMinter = await ethers.getContractFactory("contracts/EmpireCollection.sol:CollectionMinter")
  this.VasReward = await ethers.getContractFactory("VasReward")

  //deploy CollectionMinter
  this.CollectionMinter = await this.CollectionMinter.deploy()
  await this.CollectionMinter.deployed()
  console.log(`CollectionMinter Deployed at:${this.CollectionMinter.address}`)

  //Deploy VASRewards
  this.VasReward = await this.VasReward.deploy('Vas Rewards','VAS', utils.parseEther('1000000000'))
  await this.VasReward.deployed()
  console.log(`VAS Rewards Deployed at:${this.VasReward.address}`)
  


  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
