
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
require('dotenv')

async function main() {

  //get singers
  [owner, user1, user2, user3] = await ethers.getSigners()
  

  // We get the contract artifacts
  this.CollectionMinter = await ethers.getContractFactory("CollectionMinter")
  this.VasReward = await ethers.getContractFactory("VasReward")
  this.collection =await ethers.getContractFactory('EmpireCollection')

  //Get address   
  const collectionMinterAddress = process.env.CM
  const vasRewardAddress = process.env.VR

  //conect to deployed contracts
  this.CollectionMinter = this.CollectionMinter.attach(collectionMinterAddress)
  this.VasReward = this.VasReward.attach(vasRewardAddress)
  const NEONPETCollectionAddress = await this.CollectionMinter.getCollectionAddress(owner.address, 2)
  console.log(`NEONPET at ${NEONPETCollectionAddress}`) 
  this.collection = this.collection.attach(NEONPETCollectionAddress)

  await this.collection.changeRevealed(true)
  await this.collection.changeBaseURI(`${process.env.Json} `)

  //approve collection Minter
  await this.VasReward.approve(collectionMinterAddress, parseEther('100000'))
  await this.VasReward.approve(NEONPETCollectionAddress, parseEther('100000'))
  
  //mint        
  await this.CollectionMinter.mintFromExistingCollection(1, vasRewardAddress, parseEther('0.001'), 1, 500)


  console.log(`NFTs Total supply: ${ await this.collection.totalSupply()}`)
  //console.log(`Fees collected :${await this.VasReward.balanceOf(collectionMinterAddress)}`)
  //console.log(`Token 1 URI: ${ await this.collection.tokenURI(1)}`)
  //console.log(`Token 2 URI: ${await this.collection.tokenURI(2)}`)
  // console.log(`Token 3 URI: ${await this.collection.tokenURI(3)}`)
  // console.log(`Token 5 URI: ${ await this.collection.tokenURI(5)}`)

  

  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
