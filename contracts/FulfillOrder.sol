// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

interface IOpenVoiceNFT {
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) external;

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) view external returns (address, uint256);

    function getPriceInfo(uint256 tokenId) view external returns (uint256);
}

contract FulfillOrder {
    address platformAddress;
    uint96 platformFee;
    IOpenVoiceNFT nftContract;
    address owner;

    constructor(address _nftAddress, address _platformAddress, uint96 _platformFee) {
        nftContract = IOpenVoiceNFT(_nftAddress);
        platformAddress = _platformAddress;
        platformFee = _platformFee;
        owner = msg.sender;
    }

    function transferNFT(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public payable {
        require(msg.value >= nftContract.getPriceInfo(tokenId), "Didn't pay enough money");
        (address royaltyReceiver, uint256 royalty) = nftContract.royaltyInfo(tokenId, msg.value);
        nftContract.safeTransferFrom(from, to, tokenId, _data);
        // token transfer
        bool success = false;
        uint256 platformAmount = msg.value * platformFee / 10000;
        if (platformAmount > 0) {
            (success, ) = payable(platformAddress).call{value: platformAmount}("");
            require(success, "Failed to send money");
        }
        if (royalty > 0) {
            (success, ) = payable(royaltyReceiver).call{value: royalty}("");
            require(success, "Failed to send money");
        }
        uint256 sellerAmount = msg.value - platformAmount - royalty;
        (success, ) = payable(from).call{value: sellerAmount}("");
        require(success, "Failed to send money");
    }

    function setPlatformAddress(address _platformAddress) external {
        require(msg.sender == owner, "Forbidden: not allowed!");
        platformAddress = _platformAddress;
    }

    function setPlatformFee(uint96 _platformFee) external {
        require(msg.sender == owner, "Forbidden: not allowed!");
        platformFee = _platformFee;
    }
}