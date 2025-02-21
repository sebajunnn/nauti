// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OnchainWebServer_v1 {
    struct Page {
        address owner;
        string content;  // The actual code (HTML, JSX, or TSX)
        string contentType; // "html", "jsx", or "tsx"
    }

    mapping(uint256 => Page) public pages;
    uint256 public pageCount;
    uint256 public pricePerPage = 0.01 ether;

    event PageCreated(uint256 indexed pageId, address indexed owner, string contentType);
    event PageUpdated(uint256 indexed pageId, string newContent);

    function createPage(string memory _content, string memory _contentType) external payable {
        require(msg.value >= pricePerPage, "Insufficient payment");
        require(
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("html")) ||
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("jsx")) ||
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("tsx")),
            "Invalid content type"
        );

        uint256 pageId = pageCount++;
        pages[pageId] = Page(msg.sender, _content, _contentType);

        emit PageCreated(pageId, msg.sender, _contentType);
    }

    function updatePage(uint256 _pageId, string memory _newContent) external {
        require(msg.sender == pages[_pageId].owner, "Not the page owner");
        pages[_pageId].content = _newContent;
        emit PageUpdated(_pageId, _newContent);
    }

    function getPage(uint256 _pageId) external view returns (string memory, string memory) {
        return (pages[_pageId].content, pages[_pageId].contentType);
    }
}
