const { ethers } = require("hardhat");
const axios = require("axios");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(deployer.address)

    // 合约部署
    // 1. NFT 合约
    const NFT = await ethers.getContractFactory("OpenVoiceNFT");
    const baseURI = "";
    const nft = await NFT.deploy("Open Voice", "OpenVoice", baseURI);
    console.log("OpenVoiceNFT contract address: ", nft.address)    

    // 2. 销售 合约
    const FulfillOrder = await ethers.getContractFactory("FulfillOrder");
    const platformAddress = "0xdE76DB43d8C215Ba74231cb0062001ADa0750c46";
    const platformFee = 2000;    // 20%
    const fulfillOrder = await FulfillOrder.deploy(nft.address, platformAddress, platformFee);
    console.log("FulfillOrder contract address: ", fulfillOrder.address)

    // 设置代理地址（节省gas）
    await nft.setProxyAddress(fulfillOrder.address);

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

    // 2. 铸造（绑定tokenID 和 tokenURI）
    const tokenURI = res.data[0].path;
    const royalty = 100;   // 1%
    const price = '0.01';    // 0.01 ether 
    await nft.mintWithTokenURIAndRoyalty(1, [tokenURI], deployer.address, royalty, [ethers.utils.parseEther(price)]);

    // 3. 转移（直接转移，无需支付金额）
    const to = "0xeDeEC68103C5A23f7B9bFa6844Bd2435f9124790";
    // await nft.transferFrom(deployer.address, to, 0);

    // 3.2 转移（带支付金额）  
    await fulfillOrder.transferNFT(deployer.address, to, 0, '0x', {value: ethers.utils.parseEther(price)})
    console.log("token 0's owner: ", await nft.ownerOf(0));     // 查看该nft的当前拥有者地址
 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });