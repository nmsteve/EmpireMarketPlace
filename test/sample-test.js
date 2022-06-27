const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test", function (){

  before(async function () {
    this.CollectionMinter = await ethers.getContractFactory("EmpireCollection")
    this.BUSD = await ethers.getContractFactory("MockBUSDD")
    this.Marketplace = await ethers.getContractFactory("EmpireMarketplace")
    this.signers = await ethers.getSigners()
    this.owner = this.signers[0]
    this.alice = this.signers[1]
    this.bob = this.signers[2]

    this.collectionMinter = await this.CollectionMinter.deploy("1", "first", "frst")
    
    this.busd = await this.BUSD.deploy()
    this.marketplace = await this.Marketplace.deploy(this.alice.address)
  
    await this.collectionMinter.deployed()
    await this.busd.deployed()
    await this.marketplace.deployed()
    
    await console.log(this.collectionMinter.address, 'EmpireCollection minter')
    await console.log(this.busd.address, 'busd')
    

  })

  it("should mint nft", async function() {

    
    await this.collectionMinter.mintBNB(2, ethers.utils.parseEther("10"), this.owner.address, 100, {value : ethers.utils.parseEther("20")})
    
    
  })

  it("add to market nft", async function() {

    await this.marketplace.addERC20tokens(this.busd.address)
    await this.collectionMinter.approve(this.marketplace.address, 1)
    await this.collectionMinter.approve(this.marketplace.address, 2)
    await this.marketplace.addItemToMarket(1, this.collectionMinter.address, ethers.utils.parseEther("10"), false, this.busd.address)
    await this.marketplace.addItemToMarket(2, this.collectionMinter.address, ethers.utils.parseEther("10"), true, this.busd.address)
    
  })

  it("buy", async function() {
    await this.busd.transfer(this.alice.address, ethers.utils.parseEther("100"))
    await this.busd.transfer(this.bob.address, ethers.utils.parseEther("100"))
    await this.busd.connect(this.alice).approve(this.marketplace.address, ethers.utils.parseEther("30"))
    await this.busd.connect(this.bob).approve(this.marketplace.address, ethers.utils.parseEther("30"))
    await this.marketplace.connect(this.alice).BuyItem(1)
    await this.marketplace.connect(this.alice).PlaceABid(2, ethers.utils.parseEther("20"))
    await this.marketplace.connect(this.bob).PlaceABid(2, ethers.utils.parseEther("21"))
  
    let owner = await this.collectionMinter.ownerOf(2)
    console.log(owner)
    
  })

  it("end auction", async function() {
    await this.marketplace.connect(this.alice).withdrawPrevBid(2, this.busd.address)
    await this.marketplace.endAuction(2)
    let owner = await this.collectionMinter.ownerOf(2)
    console.log(owner)
    console.log(this.bob.address)
    
  })

});
