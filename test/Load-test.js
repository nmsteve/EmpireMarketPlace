const { expect,} = require("chai");
const { ethers } = require("hardhat");
const { utils} = require("ethers");

describe("LaunchpadCollection Load Testing", function(){

  before(async function(){
    [owner, user1, user2, user3, user4] =await ethers.getSigners()
      console.log(`           Owner address:${owner.address}`)


    this.ELC = await ethers.getContractFactory("LaunchpadCollection")
    this.ELC = await this.ELC.deploy("HTTP://Empire.finance/ELC/","Empire Launchpad Collection", "ELC")
    await this.ELC.deployed()
    console.log(`           LaunchpadCollection Deployed at:${this.ELC.address}`)

    this.VAS = await ethers.getContractFactory("VasReward")
    this.VAS = await this.VAS.deploy("VAS Reward Token","VAS", utils.parseEther('1000000000'))
    await this.VAS.deployed()
    console.log(`           VAS Reward Token Deploed at: ${this.VAS.address}`)



    this.CollectionMinter = await ethers.getContractFactory("CollectionMinter")
    this.CollectionMinter = await this.CollectionMinter.deploy()
      await this.CollectionMinter.deployed()
      console.log(`           CollectionMinter Deployed at:${this.CollectionMinter.address}`)


  //Set owner with (1 Sextillion) of eth to avoid -> Error: Transaction ran out of gas

  await network.provider.send("hardhat_setBalance", [ owner.address, '0xDE0B6B3A7640000'])

  })

it("Mint: load test", async function(){

    //transter 1000 VAS from owner to user1,2,3,4
  await this.VAS.transfer(user1.address, utils.parseEther('1000'))
  await this.VAS.transfer(user2.address,utils.parseEther('1000'))
  await this.VAS.transfer(user3.address, utils.parseEther('1000'))
  await this.VAS.transfer(user4.address, utils.parseEther('1000'))
  
   //set mint price to 0.1 VAS
   await this.ELC.setMintPriceInWei(utils.parseEther('0.1'))

    //approve launchpad
  await this.VAS.connect(user1).approve(this.ELC.address, utils.parseEther("1000"))
  await this.VAS.connect(user2).approve(this.ELC.address, utils.parseEther("1000"))
  await this.VAS.connect(user3).approve(this.ELC.address, utils.parseEther("1000"))
  await this.VAS.connect(user4).approve(this.ELC.address, utils.parseEther("1000"))


    //set max total supply
  await this.ELC.setMaxTotalSupply(10000)

  //set max mint amount per user
  await this.ELC.setMaxMintAmount(2000)
  
  //Owner reserver 7000 rem is 3000
  await this.ELC.reserveTokens(7000)

   //enable Minting
  await this.ELC.enableMinting()


  //Top up user to run transaction (1 sextillion)

  // await network.provider.send("hardhat_setBalance", [ user1.address, '0xDE0B6B3A7640000'])
  // await network.provider.send("hardhat_setBalance", [ user2.address, '0xDE0B6B3A7640000'])
  // await network.provider.send("hardhat_setBalance", [ user3.address, '0xDE0B6B3A7640000'])
  // await network.provider.send("hardhat_setBalance", [ user4.address, '0xDE0B6B3A7640000'])
    


  // user mint a total of 3000
  await this.ELC.connect(user3).mint(700,this.VAS.address)
  await this.ELC.connect(user1).mint(1000,this.VAS.address)
  await this.ELC.connect(user4).mint(587,this.VAS.address)
  await this.ELC.connect(user2).mint(713,this.VAS.address)


  expect(await this.VAS.balanceOf(this.ELC.address)).to.be.equals(BigInt(300*10**18))

  // Owner adds 1000 and user mints (Round 1)
  await this.ELC.connect(owner).unReserveTokens(1000)
  // user mint a total of 1000
  await this.ELC.connect(user3).mint(400,this.VAS.address)
  await this.ELC.connect(user4).mint(487,this.VAS.address)
  await this.ELC.connect(user2).mint(13,this.VAS.address)
  await this.ELC.connect(user1).mint(100,this.VAS.address)

  expect(await this.VAS.balanceOf(this.ELC.address)).to.be.equals(BigInt(400*10**18))


  // Owner adds 1000 and user mints (Round 2)
  await this.ELC.connect(owner).unReserveTokens(1000)
  // user mint a total of 1000
  await this.ELC.connect(user3).mint(412,this.VAS.address)
  await this.ELC.connect(user4).mint(487,this.VAS.address)
  await this.ELC.connect(user2).mint(13,this.VAS.address)
  await this.ELC.connect(user1).mint(88,this.VAS.address)

  expect(await this.VAS.balanceOf(this.ELC.address)).to.be.equals(BigInt(500*10**18))


  // Owner adds 1000 and user mints (Round 3)
  await this.ELC.connect(owner).unReserveTokens(1000)
  // user mint a total of 1000
  await this.ELC.connect(user4).mint(487,this.VAS.address)
  await this.ELC.connect(user2).mint(283,this.VAS.address)
  await this.ELC.connect(user1).mint(100,this.VAS.address)
  await this.ELC.connect(user3).mint(130,this.VAS.address)

  expect(await this.VAS.balanceOf(this.ELC.address)).to.be.equals(BigInt(600*10**18))


  // Owner adds 1000 and user mints (Round 4)
  await this.ELC.connect(owner).unReserveTokens(1000)
  // user mint a total of 1000
  await this.ELC.connect(user3).mint(400,this.VAS.address)
  await this.ELC.connect(user4).mint(487,this.VAS.address)
  await this.ELC.connect(user1).mint(100,this.VAS.address)
  await this.ELC.connect(user2).mint(13,this.VAS.address)

  expect(await this.VAS.balanceOf(this.ELC.address)).to.be.equals(BigInt(700*10**18))


  // Owner adds 1000 and user mints (Round 5)
  await this.ELC.connect(owner).unReserveTokens(1000)
  // user mint a total of 1000
  await this.ELC.connect(user3).mint(400,this.VAS.address)
  await this.ELC.connect(user4).mint(487,this.VAS.address)
  await this.ELC.connect(user2).mint(13,this.VAS.address)
  await this.ELC.connect(user1).mint(100,this.VAS.address)

  expect(await this.VAS.balanceOf(this.ELC.address)).to.be.equals(BigInt(800*10**18))


  // Owner adds 1000 and user mints (Round 6)
  await this.ELC.connect(owner).unReserveTokens(1000)
  // user mint a total of 1000
  await this.ELC.connect(user3).mint(400,this.VAS.address)
  await this.ELC.connect(user4).mint(487,this.VAS.address)
  await this.ELC.connect(user2).mint(13,this.VAS.address)
  await this.ELC.connect(user1).mint(100,this.VAS.address)

  expect(await this.VAS.balanceOf(this.ELC.address)).to.be.equals(BigInt(900*10**18))


  // Owner adds 1000 and user mints (Round 7)
  await this.ELC.connect(owner).unReserveTokens(1000)
  // user mint a total of 1000
  await this.ELC.connect(user3).mint(400,this.VAS.address)
  await this.ELC.connect(user4).mint(487,this.VAS.address)
  await this.ELC.connect(user2).mint(13,this.VAS.address)
  await this.ELC.connect(user1).mint(100,this.VAS.address)

  expect(await this.VAS.balanceOf(this.ELC.address)).to.be.equals(BigInt(1000*10**18))

 // Owner adds 1000 and user mints (Round 8)
 await expect(this.ELC.connect(owner).unReserveTokens(1000)).to.be.revertedWith("Insuffient tokens to unreserve")

 // user mint a total of 1000
 await expect(this.ELC.connect(user3).mint(400,this.VAS.address)).to.be.revertedWith("Exceeds max supply")
 await expect(this.ELC.connect(user4).mint(487,this.VAS.address)).to.be.revertedWith("Exceeds max supply")
 await expect(this.ELC.connect(user2).mint(13,this.VAS.address)).to.be.revertedWith("Exceeds max supply")
 await expect(this.ELC.connect(user1).mint(100,this.VAS.address)).to.be.revertedWith("Exceeds max supply")






})

})