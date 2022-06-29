
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
require('dotenv')

async function main() {

  //get singers
  [owner, user1, user2, user3] = await ethers.getSigners()
  

  // We get the contract artifacts
  this.CollectionMinter = await ethers.getContractFactory("contracts/EmpireCollection.sol:CollectionMinter")
  this.VasReward = await ethers.getContractFactory("VasReward")
  this.collection =await ethers.getContractFactory('EmpireCollection')

  //connect to deployed contracts
   const collectionMinterAddress = process.env.CMG
   const vasRewardAddress = process.env.VRG
   const NEONPETCollectionAddress = process.env.NPG

  //conect to deployed contracts
  this.CollectionMinter = this.CollectionMinter.attach(collectionMinterAddress)
  this.VasReward = this.VasReward.attach(vasRewardAddress)
  this.collection = this.collection.attach(NEONPETCollectionAddress)

  //set set Tresuary
  await this.CollectionMinter.setTresuary(user1.address)
  console.log(`Tresuary Bal:${await this.VasReward.balanceOf(user1.address)}`)



  //approve collection Minter
  this.VasReward.approve(collectionMinterAddress, parseEther('1000'))          
  await this.CollectionMinter.mintFromExistingCollection(50, vasRewardAddress, parseEther('1'), 1, 500)


  console.log(`Total Supply Is: ${await this.collection.totalSupply()}`)
  console.log(`Fees collected :${await this.VasReward.balanceOf(collectionMinterAddress)}`)
  console.log(`Token 1 URI: ${ await this.collection.tokenURI(1)}`)
  console.log(`Token 10 URI: ${await this.collection.tokenURI(10)}`)
  console.log(`Token 35 URI: ${await this.collection.tokenURI(35)}`)
  console.log(`Token 50 URI: ${ await this.collection.tokenURI(50)}`)


  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
