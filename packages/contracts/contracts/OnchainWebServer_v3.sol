// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract OnchainWebServer_v3 is ERC721URIStorage, Ownable {
    using Strings for uint256;

    struct Page {
        string content;     // The actual code (HTML, JSX, TSX, or 3D model)
        string contentType; // "html", "jsx", "tsx", or "gltf"
        string name;       // NFT name
        string description; // NFT description
    }

    mapping(uint256 => Page) public pages;
    uint256 public pageCount;
    uint256 public mintPrice = 0.01 ether;
    
    event PageMinted(uint256 indexed tokenId, address indexed owner);
    event PageUpdated(uint256 indexed tokenId, address indexed owner);
    event PriceUpdated(uint256 newPrice);

    constructor() ERC721("Web3 Pages", "W3P") Ownable(msg.sender) {}

    function mintPage(
        string memory _content,
        string memory _contentType,
        string memory _name,
        string memory _description
    ) external payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("html")) ||
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("jsx")) ||
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("tsx")) ||
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("gltf")),
            "Invalid content type"
        );
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_content).length > 0, "Content cannot be empty");

        uint256 tokenId = pageCount++;
        pages[tokenId] = Page({
            content: _content,
            contentType: _contentType,
            name: _name,
            description: _description
        });

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, generateTokenURI(tokenId));

        emit PageMinted(tokenId, msg.sender);
        return tokenId;
    }

    function updatePage(
        uint256 _tokenId,
        string memory _newContent,
        string memory _contentType,
        string memory _name,
        string memory _description
    ) external {
        require(ownerOf(_tokenId) == msg.sender, "Not the token owner");
        require(
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("html")) ||
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("jsx")) ||
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("tsx")) ||
            keccak256(abi.encodePacked(_contentType)) == keccak256(abi.encodePacked("3d")),
            "Invalid content type"
        );

        pages[_tokenId] = Page({
            content: _newContent,
            contentType: _contentType,
            name: _name,
            description: _description
        });

        _setTokenURI(_tokenId, generateTokenURI(_tokenId));
        emit PageUpdated(_tokenId, msg.sender);
    }

    function generateTokenURI(uint256 _tokenId) internal view returns (string memory) {
        Page memory page = pages[_tokenId];
        
        // Create the animation_url with content wrapper based on content type
        string memory animationUrl;
        if (keccak256(abi.encodePacked(page.contentType)) == keccak256(abi.encodePacked("html"))) {
            animationUrl = page.content;
        } else if (
            keccak256(abi.encodePacked(page.contentType)) == keccak256(abi.encodePacked("jsx")) ||
            keccak256(abi.encodePacked(page.contentType)) == keccak256(abi.encodePacked("tsx"))
        ) {
            animationUrl = string(
                abi.encodePacked(
                    '<html><head>',
                    '<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>',
                    '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>',
                    '</head><body><div id="root"></div><script>',
                    'try {',
                    'function App(){', page.content, 'return React.createElement(MyComponent);}',
                    'ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));',
                    '} catch (e) {',
                    'document.body.innerHTML = "<pre style=\\"color: red;\\">" + e.toString() + "</pre>";',
                    '}',
                    '</script></body></html>'
                )
            );
        } else {
            // 3D content - assuming it's a complete HTML with 3D viewer
            animationUrl = page.content;
        }

        // Create metadata JSON
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', page.name,
                        '", "description": "', page.description,
                        '", "animation_url": "data:text/html;base64,', 
                        Base64.encode(bytes(animationUrl)),
                        '", "attributes": [{"trait_type": "Content Type", "value": "', 
                        page.contentType,
                        '"}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function getPage(uint256 _tokenId) external view returns (Page memory) {
        require(ownerOf(_tokenId) != address(0), "Token does not exist");
        return pages[_tokenId];
    }

    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}
