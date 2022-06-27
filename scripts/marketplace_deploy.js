
const { ethers } = require("hardhat");
const { utils} = require("ethers");

async function main() {

  //get singers
  [owner, user1, user2, user3] = await ethers.getSigners()
  
  this.marketPlace = await ethers.getContractFactory('EmpireMarketplace')
  this.marketPlace = await this.marketPlace.deploy(owner.address)
  await this.marketPlace.deployed()

  console.log('MarketPlace Deployed at:', this.marketPlace.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
