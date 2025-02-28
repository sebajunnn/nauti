// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title Web3PagesMetadata
 * @dev Upgradeable contract for storing and generating NFT metadata.
 */
contract OnchainWebServerMetadata_v2 is UUPSUpgradeable, OwnableUpgradeable {
    /// @dev Structure for page metadata.
    struct Page {
        string contentUrl;
        string name;
        string description;
        string imageUrl;
    }

    /// @dev Mapping from token ID to Page data.
    mapping(uint256 => Page) public pages;

    event PageUpdated(uint256 indexed tokenId);

    /**
     * @notice Initialiser function (replaces constructor for upgradeable contracts).
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    /**
     * @dev Authorises upgrades. Only the owner can upgrade this contract.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    /**
     * @notice Update metadata for a given token.
     * @param tokenId The ID of the token.
     * @param _contentUrl The URL of the page content.
     * @param _name The display name.
     * @param _description The description.
     * @param _imageUrl The URL of the preview image.
     */
    function updatePage(
        uint256 tokenId,
        string calldata _contentUrl,
        string calldata _name,
        string calldata _description,
        string calldata _imageUrl
    ) external {
        pages[tokenId] = Page({
            contentUrl: _contentUrl,
            name: _name,
            description: _description,
            imageUrl: _imageUrl
        });
        emit PageUpdated(tokenId);
    }

    /**
     * @notice Generate the token URI with embedded metadata.
     * @param tokenId The ID of the token.
     * @return A string containing the token URI in base64-encoded JSON format.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        Page memory page = pages[tokenId];

        // Ensure the token exists
        require(bytes(page.name).length > 0, "Token does not exist");

        // Use ternary to prevent empty string issues
        string memory image = bytes(page.imageUrl).length > 0
            ? page.imageUrl
            : "";
        string memory animation = bytes(page.contentUrl).length > 0
            ? page.contentUrl
            : "";

        // Encode JSON metadata
        bytes memory json = abi.encodePacked(
            '{"name":"',
            page.name,
            '",',
            '"description":"',
            page.description,
            '",',
            '"image":"',
            image,
            '",',
            '"animation_url":"',
            animation,
            '"}'
        );

        // Base64 encode and return
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(json)
                )
            );
    }
}
