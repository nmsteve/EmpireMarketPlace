
const { ethers } = require("hardhat");
const { utils} = require("ethers");

async function main() {

  //get singers
  [owner, user1, user2, user3] = await ethers.getSigners()

  // We get the contract to deploy
  this.CollectionMinter = 


  //deploy a collection using collection minter
   await this.CollectionMinter.createNewCollection('Crypto Beetle Collection','CB',
  "https://ipfs.io/ipfs/QmRDSJdhzPwe3nnKa1KFULdjhCcuxVsJpjXn6F6PxCiU3G/", owner.address)
  
  const cryptoBeetleAddress = await this.CollectionMinter.collectionAddress()
  console.log("Cryto Beetle deployed at:",cryptoBeetleAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
