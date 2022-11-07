import { Contract } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from "../constants";

export const getEtherBalance = async (provider, address, contract = false) => {
    try {
        if (contract) {
            return provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
        } else {
            return provider.getBalance(address);
        }
    } catch (err) {
        console.error(err);
        return 0;
    }
};

export const getJAJTokensBalance = async (provider, address) => {
    try {
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            provider
        );
        return tokenContract.balanceOf(address);
    } catch (err) {
        console.error(err);
    }
};

export const getLPTokensBalance = async (provider, address) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        return exchangeContract.balanceOf(address);
    } catch (err) {
        console.error(err);
    }
};

export const getReserveOfJAJTokens = async (provider) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        return exchangeContract.getReserve();
    } catch (err) {
        console.error(err);
    }
};