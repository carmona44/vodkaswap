import { BigNumber, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import { addLiquidity, calculateJaj } from "../utils/addLiquidity";
import {
    getJajTokensBalance,
    getEtherBalance,
    getLPTokensBalance,
    getReserveOfJajTokens,
} from "../utils/getAmounts";
import {
    getTokensAfterRemove,
    removeLiquidity,
} from "../utils/removeLiquidity";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [liquidityTab, setLiquidityTab] = useState(true);
    const zero = BigNumber.from(0);
    const [ethBalance, setEtherBalance] = useState(zero);
    const [reservedJaj, setReservedJaj] = useState(zero);
    const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
    const [jajBalance, setJajBalance] = useState(zero);
    const [lpBalance, setLPBalance] = useState(zero);
    const [addEther, setAddEther] = useState(zero);
    const [addJajTokens, setAddJajTokens] = useState(zero);
    const [removeEther, setRemoveEther] = useState(zero);
    const [removeJaj, setRemoveJaj] = useState(zero);
    const [removeLPTokens, setRemoveLPTokens] = useState("0");
    const [swapAmount, setSwapAmount] = useState("");
    const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] = useState(zero);
    const [ethSelected, setEthSelected] = useState(true);
    const web3ModalRef = useRef();
    const [walletConnected, setWalletConnected] = useState(false);

    const getAmounts = async () => {
        try {
            const provider = await getProviderOrSigner(false);
            const signer = await getProviderOrSigner(true);
            const address = await signer.getAddress();
            const _ethBalance = await getEtherBalance(provider, address);
            const _jajBalance = await getJajTokensBalance(provider, address);
            const _lpBalance = await getLPTokensBalance(provider, address);
            const _reservedJaj = await getReserveOfJajTokens(provider);
            const _ethBalanceContract = await getEtherBalance(provider, null, true);
            setEtherBalance(_ethBalance);
            setJajBalance(_jajBalance);
            setLPBalance(_lpBalance);
            setReservedJaj(_reservedJaj);
            setReservedJaj(_reservedJaj);
            setEtherBalanceContract(_ethBalanceContract);
        } catch (err) {
            console.error(err);
        }
    };

    const _swapTokens = async () => {
        try {
            const swapAmountWei = utils.parseEther(swapAmount);
            if (!swapAmountWei.eq(zero)) {
                const signer = await getProviderOrSigner(true);

                setLoading(true);
                await swapTokens(signer, swapAmountWei, tokenToBeReceivedAfterSwap, ethSelected);
                setLoading(false);
                await getAmounts();
                setSwapAmount("");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setSwapAmount("");
        }
    };

    const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
        try {
            const _swapAmountWEI = utils.parseEther(_swapAmount.toString());

            if (!_swapAmountWEI.eq(zero)) {
                const provider = await getProviderOrSigner();
                const _ethBalance = await getEtherBalance(provider, null, true);
                const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
                    _swapAmountWEI,
                    provider,
                    ethSelected,
                    _ethBalance,
                    reservedJaj
                );
                settokenToBeReceivedAfterSwap(amountOfTokens);
            } else {
                settokenToBeReceivedAfterSwap(zero);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const _addLiquidity = async () => {
        try {
            const addEtherWei = utils.parseEther(addEther.toString());
            if (!addJajTokens.eq(zero) && !addEtherWei.eq(zero)) {
                const signer = await getProviderOrSigner(true);
                setLoading(true);
                await addLiquidity(signer, addJajTokens, addEtherWei);
                setLoading(false);
                setAddJajTokens(zero);
                await getAmounts();
            } else {
                setAddJajTokens(zero);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setAddJajTokens(zero);
        }
    };

    const _removeLiquidity = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const removeLPTokensWei = utils.parseEther(removeLPTokens);
            setLoading(true);
            await removeLiquidity(signer, removeLPTokensWei);
            setLoading(false);
            await getAmounts();
            setRemoveJaj(zero);
            setRemoveEther(zero);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setRemoveJaj(zero);
            setRemoveEther(zero);
        }
    };

    const _getTokensAfterRemove = async (_removeLPTokens) => {
        try {
            const provider = await getProviderOrSigner();
            const removeLPTokenWei = utils.parseEther(_removeLPTokens);
            const _ethBalance = await getEtherBalance(provider, null, true);
            const jajTokenReserve = await getReserveOfJajTokens(provider);
            const { _removeEther, _removeJaj } = await getTokensAfterRemove(
                provider,
                removeLPTokenWei,
                _ethBalance,
                jajTokenReserve
            );
            setRemoveEther(_removeEther);
            setRemoveJaj(_removeJaj);
        } catch (err) {
            console.error(err);
        }
    };

    const connectWallet = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (err) {
            console.error(err);
        }
    };

    const getProviderOrSigner = async (needSigner = false) => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 5) {
            window.alert("Change the network to Goerli");
            throw new Error("Change network to Goerli");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };

    useEffect(() => {
        if (!walletConnected) {
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();
            getAmounts();
        }
    }, [walletConnected]);

    const renderButton = () => {
        if (!walletConnected) {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Conecta tu wallet
                </button>
            );
        }

        if (loading) {
            return <button className={styles.button}>Cargando...</button>;
        }

        if (liquidityTab) {
            return (
                <div>
                    <div className={styles.description}>
                        Tienes:
                        <br />
                        {utils.formatEther(jajBalance)} JAJ Tokens
                        <br />
                        {utils.formatEther(ethBalance)} Ether
                        <br />
                        {utils.formatEther(lpBalance)} JAJ LP tokens
                    </div>
                    <div>
                        {utils.parseEther(reservedJaj.toString()).eq(zero) ? (
                            <div>
                                <input
                                    type="number"
                                    placeholder="Cantidad de Ether"
                                    onChange={(e) => setAddEther(e.target.value || "0")}
                                    className={styles.input}
                                />
                                <input
                                    type="number"
                                    placeholder="Cantidad de JAJ tokens"
                                    onChange={(e) =>
                                        setAddJajTokens(
                                            BigNumber.from(utils.parseEther(e.target.value || "0"))
                                        )
                                    }
                                    className={styles.input}
                                />
                                <button className={styles.button1} onClick={_addLiquidity}>
                                    Añadir
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="number"
                                    placeholder="Cantidad de Ether"
                                    onChange={async (e) => {
                                        setAddEther(e.target.value || "0");
                                        const _addJajTokens = await calculateJaj(
                                            e.target.value || "0",
                                            etherBalanceContract,
                                            reservedJaj
                                        );
                                        setAddJajTokens(_addJajTokens);
                                    }}
                                    className={styles.input}
                                />
                                <div className={styles.inputDiv}>
                                    {`Necesitarás ${utils.formatEther(addJajTokens)} JAJ Tokens`}
                                </div>
                                <button className={styles.button1} onClick={_addLiquidity}>
                                    Añadir
                                </button>
                            </div>
                        )}
                        <div>
                            <input
                                type="number"
                                placeholder="Cantidad de LP Tokens"
                                onChange={async (e) => {
                                    setRemoveLPTokens(e.target.value || "0");
                                    await _getTokensAfterRemove(e.target.value || "0");
                                }}
                                className={styles.input}
                            />
                            <div className={styles.inputDiv}>
                                {`Obtendrás ${utils.formatEther(removeJaj)} JAJ Tokens y ${utils.formatEther(removeEther)} ETH`}
                            </div>
                            <button className={styles.button1} onClick={_removeLiquidity}>
                                Retirar
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <input
                        type="number"
                        placeholder="Cantidad"
                        onChange={async (e) => {
                            setSwapAmount(e.target.value || "");
                            await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
                        }}
                        className={styles.input}
                        value={swapAmount}
                    />
                    <select
                        className={styles.select}
                        name="dropdown"
                        id="dropdown"
                        onChange={async () => {
                            setEthSelected(!ethSelected);
                            await _getAmountOfTokensReceivedFromSwap(0);
                            setSwapAmount("");
                        }}
                    >
                        <option value="eth">Ethereum</option>
                        <option value="jajToken">JAJ Token</option>
                    </select>
                    <br />
                    <div className={styles.inputDiv}>
                        {ethSelected
                            ? `Obtendrás ${utils.formatEther(tokenToBeReceivedAfterSwap)} JAJ Tokens`
                            : `Obtendrás ${utils.formatEther(tokenToBeReceivedAfterSwap)} ETH`}
                    </div>
                    <button className={styles.button1} onClick={_swapTokens}>
                        Intercambiar
                    </button>
                </div>
            );
        }
    };

    return (
        <div>
            <Head>
                <title>vodkaswap</title>
                <meta name="description" content="vodkaswap" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.main}>
                <div>
                    <h1 className={styles.title}>¡Bienvenido a vodkaswap Exchange!</h1>
                    <div className={styles.description}>
                        Exchange Ethereum &#60;&#62; JAJ Tokens
                    </div>
                    <div>
                        <button
                            className={styles.button}
                            onClick={() => {
                                setLiquidityTab(true);
                            }}
                        >
                            Liquidez
                        </button>
                        <button
                            className={styles.button}
                            onClick={() => {
                                setLiquidityTab(false);
                            }}
                        >
                            Intercambiar
                        </button>
                    </div>
                    {renderButton()}
                </div>
                <div>
                    <img className={styles.image} src="./main.png" />
                </div>
            </div>

            <footer className={styles.footer}>
                Made with ❤️ by Carmona44
            </footer>
        </div>
    );
}