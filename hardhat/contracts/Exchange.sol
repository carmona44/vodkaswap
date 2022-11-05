// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public jajTokenAddress;

    constructor(address _JajToken) ERC20("JAJ LP Token", "JLP") {
        require(
            _JajToken != address(0),
            "Token address passed is a null address"
        );
        jajTokenAddress = _JajToken;
    }
}
