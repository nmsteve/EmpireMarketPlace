// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

interface IEmpireCollection{
    function getAddress() external view returns(address);
    function mint(uint256 num, address token, uint256 mintPriceInWei, address user, uint96 royalties) external;
    function mintBNB(uint256 num, uint256 mintPriceInWei, address user, uint96 royalties) external payable; 
}

contract EmpireCollection is ERC721, Ownable, ERC721Royalty, IEmpireCollection{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    string public baseURI;
    uint256 public _totalSupply;
    bool public revealed = false;
    address public deployer;
    

    

    event LogChangeBaseURI(string _baseURI);
    event LogWithdraw(address account, uint256 amount);
    event LogWithdrawERC20(address account, uint256 amount, address token);

    modifier onlyOwnerOrDeployer() {
        require(owner() == _msgSender() || deployer == _msgSender(), "Ownable: caller is not the owner or deployer");
        _;
    }


    constructor(string memory baseURI_, string memory name, string memory ticker, address _deployer) ERC721(name, ticker) {
        // Set contract URI
        baseURI = baseURI_;
        deployer = _deployer;
    }

    function changeRevealed(bool _revealed) public onlyOwnerOrDeployer {
        revealed = _revealed;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function changeBaseURI(string memory baseURI_) public onlyOwnerOrDeployer {
        baseURI = baseURI_;
        emit LogChangeBaseURI(baseURI_);
    }
    
    function getAddress() external override view returns(address){
        return address(this);
    }
    
    function mint(uint256 num, address token, uint256 mintPriceInWei, address user, uint96 royalties) override public onlyOwnerOrDeployer{
        uint256 amount = num * mintPriceInWei;
        require(IERC20(token).allowance(user, address(this)) >= amount, "Insufficient allowance.");
        require(IERC20(token).balanceOf(user) >= amount, "Insufficient balance.");
        require(royalties <= 1000, "Max Royalties 10%");

        for(uint256 i; i < num; i++){
           _tokenIds.increment();
           uint256 newItemId = _tokenIds.current();
           _totalSupply += 1;
           _setTokenRoyalty(newItemId, user, royalties);
           _safeMint(user, newItemId);
        }
        IERC20(token).transferFrom(user, owner(), amount);
    }

    function mintBNB(uint256 num, uint256 mintPriceInWei, address user, uint96 royalties) public override payable onlyOwnerOrDeployer{
        uint256 amount = num * mintPriceInWei;
        require(msg.value >= amount, "Not enough bnb sent");
        require(royalties <= 1000, "Max Royalties 10%");
        for(uint256 i; i < num; i++){
           _tokenIds.increment();
           uint256 newItemId = _tokenIds.current();
           _totalSupply += 1;
           _setTokenRoyalty(newItemId, user, royalties);
           _safeMint(user, newItemId);
        }

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

    function withdraw(address payable account, uint256 amount) external onlyOwnerOrDeployer{
        require(amount <= address(this).balance, "Insuficcient funds");
        account.transfer(amount);
        emit LogWithdraw(account, amount);
    }

    function withdrawERC20(address account, uint256 amount, address token) external onlyOwnerOrDeployer{
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

contract CollectionMinter is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _collectionIds;
    address tresuary;
    event NewCollection(address collection, address owner);
    event MintFromExistingCollection(address collectionAddr, uint256 num, uint256 mintPriceInWei, uint256 collectionId, address owner);
    event MintFromExistingCollectionBNB(address collectionAddr, uint256 num, uint256 mintPriceInWei, uint256 collectionId, address owner);
    event LogSetTresuary(address _tresuary);

    mapping(address => mapping(uint256 => address)) userCollection;
    mapping(uint256 => address) ownerOf;
    
    function setTresuary(address _tresuary) external onlyOwner{
        tresuary = _tresuary;
        emit LogSetTresuary(_tresuary);
    }
    
    function createNewCollection(string memory _baseURI,string memory name, string memory symbol,  address owner) external{
        _collectionIds.increment();
        uint256 newCollectionId = _collectionIds.current();
        EmpireCollection collection = new EmpireCollection(_baseURI,name,symbol, owner);
        address collectionAddress = collection.getAddress();
        userCollection[msg.sender][newCollectionId] = collectionAddress;
        ownerOf[newCollectionId] = msg.sender;
        emit NewCollection(collectionAddress, msg.sender);
    }

    function getOwnerOf(uint256 id) external view returns(address){
        return ownerOf[id];
    }

    function getCollectionAddress(address owner, uint256 collectionId) external view returns(address){
        return userCollection[owner][collectionId];
    }

    function mintFromExistingCollection(uint256 num, address token, uint256 mintPriceInWei, uint256 collectionId, uint96 royalties) external{
        require(ownerOf[collectionId] == msg.sender);
        address collectionAddr = userCollection[msg.sender][collectionId];
        IEmpireCollection(collectionAddr).mint(num, token, mintPriceInWei, msg.sender, royalties);
    }
    
    function mintFromExistingCollectionBNB(uint256 num, uint256 mintPriceInWei, uint256 collectionId, uint96 royalties) external payable{
        require(ownerOf[collectionId] == msg.sender);
        address collectionAddr = userCollection[msg.sender][collectionId];
        IEmpireCollection(collectionAddr).mintBNB{value: msg.value}(num, mintPriceInWei, msg.sender, royalties);
        
    }

}