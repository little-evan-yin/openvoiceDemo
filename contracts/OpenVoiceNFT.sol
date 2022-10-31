// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;
import "./ERC721A.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "./ERC721AURIStorage.sol";

contract OpenVoiceNFT is ERC2981, ERC721AURIStorage {
    string private _baseTokenURI;
    address owner;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721A(name, symbol) {
        _baseTokenURI = baseTokenURI;
        _setDefaultRoyalty(msg.sender, 100);      // default royalty for all nfts, 100 means 1%
        owner = msg.sender;
    }

    function setProxyAddress(address _proxyAddress) external {
        require(msg.sender == owner, "Forbidden: not allowed!");
        proxyAddress = _proxyAddress;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function mint(uint256 quantity) public {
        _safeMint(msg.sender, quantity);   
    }

    function mintWithTokenURIAndRoyalty(uint256 quantity, string[] memory tokenURI, address royaltyReceiver, uint96 feeNumerator) public {
        // id自增
        uint256 startTokenId = _nextTokenId();
        uint256 end = startTokenId + quantity;

        _safeMint(msg.sender, quantity);
        // update this tokens royalty info    
        for (uint256 tokenId=startTokenId; tokenId < end; tokenId++) {
            _setTokenRoyalty(tokenId, royaltyReceiver, feeNumerator);
            _setTokenURI(tokenId, tokenURI[tokenId - startTokenId]);
        }
    }
 
    function burn(uint256 tokenId) public {
        _burn(tokenId, false);
        _resetTokenRoyalty(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, ERC2981) returns (bool) {
        // The interface IDs are constants representing the first 4 bytes
        // of the XOR of all function selectors in the interface.
        // See: [ERC165](https://eips.ethereum.org/EIPS/eip-165)
        // (e.g. `bytes4(i.functionA.selector ^ i.functionB.selector ^ ...)`)
        return
            interfaceId == 0x01ffc9a7 || // ERC165 interface ID for ERC165.
            interfaceId == 0x80ac58cd || // ERC165 interface ID for ERC721.
            interfaceId == 0x2a55205a || // ERC165 interface ID for ERC2981.
            interfaceId == 0x5b5e139f; // ERC165 interface ID for ERC721Metadata.
    }

    // OpenSea metadata initialization
    function contractURI() public pure returns (string memory) {
        return "";
    }
}