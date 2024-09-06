// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ViralPoints} from "../src/ViralPoints.sol";

contract ViralPointsTest is Test {
    ViralPoints public viralPoints;

    function setUp() public {
        viralPoints = new ViralPoints();
    }

    function test_Mint() public {
        address recipient = address(1234);
        uint256 balanceBefore = viralPoints.balanceOf(recipient);
        assertEq(balanceBefore, 0);
        viralPoints.mint(address(1234), 100 ether);
        uint256 balanceAfter = viralPoints.balanceOf(recipient);
        assertEq(balanceAfter, 100 ether);
    }

    function testFail_Mint() public {
        // Not owner
        vm.prank(address(1234));
        viralPoints.mint(address(1234), 100 ether);
    }
}
