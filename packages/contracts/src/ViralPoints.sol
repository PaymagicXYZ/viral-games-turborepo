// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "solmate/tokens/ERC20.sol";
import "solmate/auth/Owned.sol";

contract ViralPoints is ERC20, Owned {
    constructor() ERC20("ViralPoints", "$POINTS", 18) Owned(msg.sender) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
