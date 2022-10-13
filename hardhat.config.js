require("@nomiclabs/hardhat-waffle");

const SECRET_KEY = process.env.SECRET_KEY
const INFURA_API_KEY = process.env.INFURA_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SECRET_KEY]
    }
  }
};
