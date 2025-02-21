// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OnchainWebServer {
    struct Page {
        address owner;
        string content; // HTML stored onchain (can be split if too large)
    }

    mapping(uint256 => Page) public pages;
    uint256 public pageCount;
    uint256 public pricePerPage = 0.01 ether; // Set a base price

    event PageCreated(uint256 indexed pageId, address indexed owner);
    event PageUpdated(uint256 indexed pageId, string newContent);

    function createPage(string memory _content) external payable {
        require(msg.value >= pricePerPage, "Insufficient funds");
        
        uint256 pageId = pageCount++;
        pages[pageId] = Page(msg.sender, _content);

        emit PageCreated(pageId, msg.sender);
    }

    function updatePage(uint256 _pageId, string memory _newContent) external {
        require(msg.sender == pages[_pageId].owner, "Not owner");

        pages[_pageId].content = _newContent;

        emit PageUpdated(_pageId, _newContent);
    }

    function getPage(uint256 _pageId) external view returns (string memory) {
        return pages[_pageId].content;
    }
}
