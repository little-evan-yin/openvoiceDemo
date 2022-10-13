const { ethers } = require("hardhat");
const axios = require("axios");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(deployer.address)

    // 合约部署
    const NFT = await ethers.getContractFactory("OpenVoiceNFT");
    const baseURI = "";
    const nft = await NFT.deploy("Open Voice", "OpenVoice", baseURI);
    console.log("OpenVoiceNFT address: ", nft.address)    

    // 铸造nft
    // 1. 上传metadata到ipfs（使用moralis api）
    const metadata = {
        "name": "Quiero Pancakes",
        "attributes": {
            "birthday": "03-04",
            "birth month": "March",
            "zodiac sign": "Pisces"
        },
        "image": "https://birthstamps.herokuapp.com/images/4.png",
        "description": "This is the tokens description"
    }

    const data = [{
        path: "openvoice/0.json",
        content: Buffer.from(JSON.stringify(metadata)).toString('base64')
    }]
    
    const moralisUploadUrl = 'https://deep-index.moralis.io/api/v2/ipfs/uploadFolder'
    const options = {
        method: 'POST',
        url: moralisUploadUrl,
        data: data,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-Key': 'test'     
        }
    }

    const res = await axios(options);
    console.log(res.data);

    const tokenURI = res.data[0].path
    // 2. 铸造（绑定tokenID 和 tokenURI）
    await nft.mintWithTokenURIAndRoyalty(1, [tokenURI], 100);

    // 3. 转移
    const to = "0xeDeEC68103C5A23f7B9bFa6844Bd2435f9124790"
    await nft.transferFrom(deployer.address, to, 0);

    console.log("token 0's owner: ", await nft.ownerOf(0))     // 查看该nft的当前拥有者地址
 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });