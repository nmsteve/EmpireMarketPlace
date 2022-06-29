// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEmpireCollection{
    function getAddress() external view returns(address);
    function mint(uint256 num, address token, uint256 mintPriceInWei, address user) external;
}

contract LaunchpadCollection is ERC721, Ownable, ERC721Royalty{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    string public baseURI;
    bool public revealed = false; 
    bool public mintingEnabled;

    
    uint256 public mintPriceInWei;
    bool private _tokensReserved; 
    uint256 private _numTokensReserved = 0;
    uint256 public maxTotalSupply;
    uint256 public _totalSupply;
    uint256 public maxMintAmount;

    event LogSetMaxMintAmount(uint256 num);
    event LogSetMintPriceInWei(uint256 mintPriceInWei);
    event LogReserveTokens(uint256 num);
    event LogUnReserveTokens(uint256 num);
    event LogEnableMinting();
    event LogDisableMinting();
    event LogChangeBaseURI(string _baseURI);
    event LogWithdraw(address account, uint256 amount);
    event LogWithdrawERC20(address account, uint256 amount, address token);


    constructor(string memory baseURI_, string memory name, string memory ticker, address owner) ERC721(name, ticker) {
        // Set contract URI
        baseURI = baseURI_;
        _transferOwnership(owner);
    }

    function setMaxMintAmount(uint256 _maxMintAmount) external onlyOwner{
        maxMintAmount = _maxMintAmount;
        emit LogSetMaxMintAmount(_maxMintAmount);
    }

    function setMintPriceInWei(uint256 _mintPriceInWei) external onlyOwner{
        mintPriceInWei = _mintPriceInWei;
        emit LogSetMintPriceInWei(_mintPriceInWei);
    }

    function reserveTokens(uint256 num) external onlyOwner{
        uint256 supply = totalSupply();
        require(supply + _numTokensReserved + num <= maxTotalSupply, "Exceeds maxTotalSupply");
        _numTokensReserved += num;
        if(_numTokensReserved > 0 && _tokensReserved != true){
           _tokensReserved = true;
        }
        emit LogReserveTokens(num);
    }

    function unReserveTokens(uint256 num) external onlyOwner{
        require(_numTokensReserved >= num, "Insuffient amount of tokens to unreserve");
        _numTokensReserved -= num;

        if(_numTokensReserved == 0){
           _tokensReserved = false;
        } 
        emit LogUnReserveTokens(num);
    }
    
    function enableMinting() external onlyOwner{
        require(!mintingEnabled, "Minting alrready enabled");
        mintingEnabled = true;
        emit LogEnableMinting();
    }

    function disableMinting() external onlyOwner{
        require(mintingEnabled, "Minting alrready enabled");
        mintingEnabled = false;
        emit LogDisableMinting();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function changeBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
        emit LogChangeBaseURI(baseURI_);
    }

    function changeRevealed(bool _revealed) public onlyOwner {
        revealed = _revealed;
    }
    
    function mint(uint256 num, address token) public {
        uint256 supply = totalSupply();
        uint256 amount = num * mintPriceInWei;
        require(num <= maxMintAmount, "Exceeds max token mint for user");
        require(mintingEnabled, "Minting disabled");
        require(IERC20(token).allowance(msg.sender, address(this)) >= amount, "Insufficient allowance.");
        require(IERC20(token).balanceOf(msg.sender) >= amount, "Insufficient balance.");
        require(supply + num <= maxTotalSupply, "Exceeds max supply");
        if(_tokensReserved = true){
            require(supply + num <= maxTotalSupply - _numTokensReserved, "Exceeds total supply");
        }

        for(uint256 i; i < num; i++){
           _tokenIds.increment();
           uint256 newItemId = _tokenIds.current();
           _totalSupply += 1;
           _safeMint(msg.sender, newItemId);
        }
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI_ = _baseURI();

        if (revealed) {
            return bytes(baseURI_).length > 0 ? string(abi.encodePacked(baseURI_, Strings.toString(tokenId), ".json")) : "";
        } else {
            return string(abi.encodePacked(baseURI_, "empirehidden.json"));
        }
    }

    function withdraw(address payable account, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insuficcient funds");
        account.transfer(amount);
        emit LogWithdraw(account, amount);
    }

    function withdrawERC20(address account, uint256 amount, address token) external onlyOwner {
        require(amount <= IERC20(token).balanceOf(address(this)), "Insuficcient funds");
        IERC20(token).transfer(account, amount);
        emit LogWithdrawERC20(account, amount, token);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721Royalty) {
        _totalSupply -= 1;
        super._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }
    
    function totalSupply() public view returns(uint256){
        return _totalSupply;
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Royalty)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}

contract CollectionMinterr{
    using Counters for Counters.Counter;
    Counters.Counter private _collectionIds;
    event NewCollection(IERC721 collection);
    mapping(address => mapping(uint256 => address)) userCollection;
    
    
    function createNewCollection(string memory name, string memory symbol, string memory _baseURI, address owner) external{
        LaunchpadCollection collection = new LaunchpadCollection(_baseURI,name,symbol, owner);
        emit NewCollection(collection);
    }
    
    
}