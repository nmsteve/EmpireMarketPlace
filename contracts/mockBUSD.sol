// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBUSDD is ERC20("Mock BUSD", "BUSD") {
    constructor() {
        // mint 1 million BUSD / 18 decimals
        _mint(msg.sender, 50**24);
    }
}