// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OnchainWebServer
 * @dev A contract for minting and managing web pages as NFTs
 * Each NFT represents a web page with HTML content stored on-chain
 */
contract OnchainWebServer_v6 is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;

    /**
     * @dev Structure for storing page data
     * @param content The HTML content of the page
     * @param name The display name of the page
     * @param description A brief description of the page
     */
    struct Page {
        string content;
        string name;
        string description;
    }

    /// @dev Mapping from token ID to Page data
    mapping(uint256 => Page) public pages;
    /// @dev Counter for token IDs
    uint256 private _tokenIds;
    /// @dev Price to mint a new page
    uint256 public mintPrice = 0.01 ether;

    /// @dev Emitted when a new page is minted
    event PageMinted(uint256 indexed tokenId, address indexed owner);
    /// @dev Emitted when a page's content is updated
    event PageUpdated(uint256 indexed tokenId, address indexed owner);
    /// @dev Emitted when the mint price is updated
    event PriceUpdated(uint256 newPrice);
    /// @dev Emitted when funds are withdrawn from the contract
    event WithdrawalComplete(address owner, uint256 amount);

    /**
     * @dev Constructor initializes the ERC721 token with name and symbol
     */
    constructor() ERC721("Web3 Pages", "W3P") Ownable(msg.sender) {}

    /**
     * @notice Mint a new web page NFT
     * @dev Creates a new token with the provided content and metadata
     * @param _content The HTML content of the page
     * @param _name The display name of the page
     * @param _description A brief description of the page
     * @return uint256 The ID of the newly minted token
     */
    function mintPage(
        string memory _content,
        string memory _name,
        string memory _description
    ) external payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_content).length > 0, "Content cannot be empty");

        uint256 tokenId = _tokenIds++;

        pages[tokenId] = Page({
            content: _content,
            name: _name,
            description: _description
        });

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, generateTokenURI(tokenId));

        emit PageMinted(tokenId, msg.sender);
        return tokenId;
    }

    /**
     * @notice Update the content of an existing page
     * @dev Only the owner of the token can update its content
     * @param _tokenId The ID of the token to update
     * @param _newContent The new HTML content
     * @param _name The new name
     * @param _description The new description
     */
    function updatePage(
        uint256 _tokenId,
        string memory _newContent,
        string memory _name,
        string memory _description
    ) external {
        require(ownerOf(_tokenId) == msg.sender, "Not the token owner");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_newContent).length > 0, "Content cannot be empty");

        pages[_tokenId] = Page({
            content: _newContent,
            name: _name,
            description: _description
        });

        _setTokenURI(_tokenId, generateTokenURI(_tokenId));
        emit PageUpdated(_tokenId, msg.sender);
    }

    /**
     * @dev Generates the token URI with metadata in base64 format
     * @param _tokenId The ID of the token
     * @return string The complete token URI with embedded metadata
     */
    function generateTokenURI(
        uint256 _tokenId
    ) internal view returns (string memory) {
        Page memory page = pages[_tokenId];
        string memory animationUrl = page.content;

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        page.name,
                        '", "description": "',
                        page.description,
                        '", "animation_url": "data:text/html;base64,',
                        Base64.encode(bytes(animationUrl)),
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @notice Retrieve the content and metadata of a page
     * @dev Reverts if the token does not exist
     * @param _tokenId The ID of the token to query
     * @return Page The page data including content, name, and description
     */
    function getPage(uint256 _tokenId) external view returns (Page memory) {
        require(ownerOf(_tokenId) != address(0), "Token does not exist");
        return pages[_tokenId];
    }

    /**
     * @notice Update the price required to mint a new page
     * @dev Only callable by contract owner
     * @param _newPrice The new price in wei
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }

    /**
     * @notice Withdraws the entire contract balance to the owner
     * @dev Uses nonReentrant modifier to prevent reentrancy attacks
     * Uses call pattern instead of transfer for better compatibility
     * Emits WithdrawalComplete event on success
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit WithdrawalComplete(owner(), balance);
    }

    /**
     * @notice Returns the total number of tokens minted
     * @return uint256 The current token count
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
}
