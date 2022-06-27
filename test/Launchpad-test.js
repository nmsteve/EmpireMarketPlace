const { expect,} = require("chai");
const { ethers } = require("hardhat");
const { utils} = require("ethers");

describe.only("LaunchpadCollection Testing", function(){

  before(async function(){
    [owner, user1, user2, user3, user4] =await ethers.getSigners()
      console.log(`           Owner address:${owner.address}`)

    this.VAS = await ethers.getContractFactory("VasReward")
    this.VAS = await this.VAS.deploy("VAS Reward Token","VAS", utils.parseEther('1000000000'))
    await this.VAS.deployed()
    console.log(`           VAS Reward Token Deploed at: ${this.VAS.address}`)


    this.CollectionMinter = await ethers.getContractFactory("CollectionMinter")
    this.CollectionMinter = await this.CollectionMinter.deploy()
    await this.CollectionMinter.deployed()
    console.log(`           CollectionMinter Deployed at:${this.CollectionMinter.address}`)

    await this.CollectionMinter.createNewCollection("CryptoOwl Collection", "COC", "HTTPS://Empire/collections/COC/",owner.address) 
    const CryptoOwlAddress = await this.CollectionMinter.collectionAddress()
    console.log(`           CryptoOwl Collection deployed at:${CryptoOwlAddress}`)

   //1.using getContractAt
   this.COC = await ethers.getContractAt("LaunchpadCollection",CryptoOwlAddress)
   //2. using attach
   this.COC = await ethers.getContractFactory("LaunchpadCollection"); this.COC = this.COC.attach(CryptoOwlAddress)


  //Set owner with (1 Sextillion) of eth to avoid -> Error: Transaction ran out of gas

  await network.provider.send("hardhat_setBalance", [ owner.address, '0xDE0B6B3A7640000'])

  })

  describe("LaunchpadCollection: Set", function() {
    it("Set maxmum mint amount", async function(){
      await expect(this.COC.setMaxMintAmount(10)).to.emit(this.COC,"LogSetMaxMintAmount").withArgs(10)

    })
    it("set mint price in Wei",  async function(){
      await expect(this.COC.setMintPriceInWei(utils.parseEther('1'))).to.emit(this.COC,"LogSetMintPriceInWei").withArgs(BigInt(10**18))
    })

    it("Set maxmum total supply",async function(){
      await expect(this.COC.setMaxTotalSupply(15)).to.emit(this.COC, "LogMaxTotalSupply").withArgs(15)
    })
  
    it("Enable Minting", async function(){
      await expect(this.COC.enableMinting()).to.emit(this.COC,"LogEnableMinting")
      //revert
      await expect(this.COC.enableMinting()).to.be.revertedWith("Minting already enabled")

    })

    it("Disable Miniting", async function(){
      await expect(this.COC.disableMinting()).to.emit(this.COC,"LogDisableMinting")
      //revert
      await expect(this.COC.disableMinting()).to.be.revertedWith("Minting already disabled")
    })
  
    it("Change the base URI",async function(){
      //check current URI
      expect(await this.COC.baseURI()).to.be.equals("HTTPS://Empire/collections/COC/")
      //make change
      await expect(this.COC.changeBaseURI("HTTP://nft.Empire/collection/coc/")).to.emit(this.COC,"LogChangeBaseURI").withArgs("HTTP://nft.Empire/collection/coc/")
    })

  })

  describe("launchpadCollection: Reserve", function(){
    it("Reserve Tokens", async function(){
      await expect(this.COC.reserveTokens(4)).to.emit(this.COC, "LogReserveTokens").withArgs(4)

      //revert: When maxmum total supply set is exceeded
      await expect(this.COC.reserveTokens(12)).to.be.revertedWith("Exceeds maxTotalSupply")
    })

    it("Unreserve Tokens", async function() {
       await expect(this.COC.unReserveTokens(2)).to.emit(this.COC, "LogUnReserveTokens").withArgs(2)

       //Revert: When number of token to unreserver is more than revered tokens
       await expect(this.COC.unReserveTokens(7)).to.be.revertedWith("Insuffient tokens to unreserve")

    })
  })

  describe("LaunchpadCollection: Minting", function(){


    it("Mint", async function (){

       //transter 15 VAS from owner to user1
    await this.VAS.transfer(user1.address, utils.parseEther('15'))
      //approve launchpad
    await this.VAS.connect(user1).approve(this.COC.address, utils.parseEther("10"))
      //enable Minting
    await expect(this.COC.enableMinting()).to.emit(this.COC,"LogEnableMinting")

    this.COC = await this.COC.connect(user1)

    expect(await this.COC.mint(6, this.VAS.address)).to.emit(this.COC, "Mint").withArgs(6,BigInt(6*10**18))
    expect(await this.VAS.balanceOf(this.COC.address)).to.be.equal(BigInt(6*10**18))

    //reverts
       //1. When number of token Exceeds max token mint for user
    await expect(this.COC.mint(12, this.VAS.address)).to.be.revertedWith("Exceeds max token mint for user")
      //2. When Minting is disabled
    await this.COC.connect(owner).disableMinting()
    await expect(this.COC.mint(5, this.VAS.address)).to.be.revertedWith("Minting disabled")
      //3. When there is allowance is Insufficient
    await this.VAS.connect(user1).approve(this.COC.address, utils.parseEther('1'))
    await this.COC.connect(owner).enableMinting()
    await expect(this.COC.mint(4, this.VAS.address)).to.be.revertedWith("Insufficient allowance.")
     //4. When balance of sender is insufficient
    await this.VAS.connect(user1).transfer(user2.address, utils.parseEther('9'))
    await this.VAS.connect(user1).approve(this.COC.address, utils.parseEther('10'))
    await expect(this.COC.mint(6, this.VAS.address)).to.be.revertedWith("Insufficient balance.")

    //5. When Max supply is exceeded
    await this.VAS.transfer(user1.address, utils.parseEther('20'))
    await expect(this.COC.mint(10, this.VAS.address)).to.be.revertedWith("Exceeds max supply")

    //6. When Exceeds total supply
    await expect(this.COC.mint(8, this.VAS.address)).to.be.revertedWith("Exceeds total supply")

    })

  })

  describe("LaunchpadCollection:tokenURI", function(){
    it("Display Unrevealed token URI", async function(){
     console.log(`            ${await this.COC.tokenURI(1)}`)
     //revert: when ID does not exist
     await expect(this.COC.tokenURI(20000)).to.revertedWith("ERC721Metadata:nonexistent token")
    })

    it("Display Revealed token URI", async function(){
      await this.COC.changeRevealed(true)
      console.log(`            ${await this.COC.tokenURI(1)}`)

    })
  })


})
