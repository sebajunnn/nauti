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
        string content;
        string name;
        string description;
        string imageUrl; // New field for image URL
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
     * @param _content The HTML content of the page.
     * @param _name The display name.
     * @param _description The description.
     * @param _imageUrl The URL of the preview image.
     */
    function updatePage(
        uint256 tokenId,
        string calldata _content,
        string calldata _name,
        string calldata _description,
        string calldata _imageUrl
    ) external {
        pages[tokenId] = Page({
            content: _content,
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
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        page.name,
                        '", "description": "',
                        page.description,
                        '", "image": "',
                        page.imageUrl,
                        '", "animation_url": "data:text/html;base64,',
                        Base64.encode(bytes(page.content)),
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
