const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT contract", function () {
  it("Deployment should mint a token to owner", async function () {
    const NFT = await ethers.getContractFactory("OpenVoiceNFT");

    const hardhatNFT = await NFT.deploy("Open Voice", "OV", "");     
    await hardhatNFT.deployed();

    console.log("OpenVoiceNFT logic deployed to:", hardhatNFT.address);  

    // start mint
    const tokenURI = "https://ipfs.moralis.io:2053/ipfs/QmZAGNXhZfn5vvhuD5nkR61GkDEGe8CwZAN2jZ1WW8GPhZ/openvoice/1.json"
    await hardhatNFT.mintWithTokenURIAndRoyalty(1, [tokenURI], 100);
    expect(await hardhatNFT.tokenURI(0)).to.equal(tokenURI)
  });
});