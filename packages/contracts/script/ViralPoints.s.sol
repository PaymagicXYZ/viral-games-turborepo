// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/ViralPoints.sol";

contract ViralPointsScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("TESTNET_DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        ViralPoints token = new ViralPoints();

        vm.stopBroadcast();

        console.log("ViralPoints ERC20 deployed to:", address(token));
    }
}
