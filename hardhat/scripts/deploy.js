const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { JAJ_TOKEN_CONTRACT_ADDRESS } = require("../constants");

async function main() {

    const jajTokenAddress = JAJ_TOKEN_CONTRACT_ADDRESS;
    const exchangeContract = await ethers.getContractFactory("Exchange");

    const deployedExchangeContract = await exchangeContract.deploy(jajTokenAddress);
    await deployedExchangeContract.deployed();

    console.log("Exchange Contract Address:", deployedExchangeContract.address);
    //0x230D7cC2d7E5981E5c7389d678D90b61C54deeCA
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });