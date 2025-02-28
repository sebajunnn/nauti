// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Interface for interacting with the Metadata contract
interface IMetadata {
    function updatePage(
        uint256 tokenId,
        string calldata _content,
        string calldata _name,
        string calldata _description,
        string calldata _imageUrl
    ) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);
}

/**
 * @title Web3PagesNFT
 * @dev NFT contract for minting web pages, delegating metadata to a separate contract.
 */
contract OnchainWebServer_v8 is ERC721, Ownable {
    // Address of the deployed metadata contract
    address public metadataContract;

    uint256 public mintPrice = 0.01 ether;
    uint256 private _tokenIds;

    event PageMinted(uint256 indexed tokenId, address indexed owner);

    constructor(
        address _metadataContract
    ) ERC721("Nauti", "N/A") Ownable(msg.sender) {
        metadataContract = _metadataContract;
    }

    /**
     * @notice Mint a new web page NFT.
     * @param _content The HTML content of the page.
     * @param _name The display name of the page.
     * @param _description A brief description of the page.
     * @param _imageUrl The URL of the preview image.
     * @return tokenId The ID of the newly minted token.
     */
    function mintPage(
        string calldata _content,
        string calldata _name,
        string calldata _description,
        string calldata _imageUrl
    ) external payable returns (uint256 tokenId) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_imageUrl).length > 0, "Image URL cannot be empty");

        tokenId = _tokenIds++;
        _safeMint(msg.sender, tokenId);

        // Delegate metadata storage/update to the metadata contract.
        IMetadata(metadataContract).updatePage(
            tokenId,
            _content,
            _name,
            _description,
            _imageUrl
        );

        emit PageMinted(tokenId, msg.sender);
    }

    /**
     * @notice Returns the token URI by fetching metadata from the metadata contract.
     * @param tokenId The ID of the token.
     * @return A string containing the token URI.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return IMetadata(metadataContract).tokenURI(tokenId);
    }

    /**
     * @notice Allows the owner to update the metadata contract pointer.
     * @param _metadataContract The address of the new metadata contract.
     */
    function setMetadataContract(address _metadataContract) external onlyOwner {
        metadataContract = _metadataContract;
    }

    /**
     * @notice Returns the total number of tokens minted
     * @return uint256 The current token count
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
}
