// SPDX-License-Identifier: -- BCOM --

pragma solidity ^0.8.24;

import "forge-std/Script.sol";

import "../src/PayoutFlux.sol";

contract DeployPayoutFlux is Script {

    function setUp() public {}

    function run() public {

        vm.startBroadcast(
            vm.envUint("PRIVATE_KEY")
        );

        // Deploy MultiTokenPayout contract (no constructor parameters needed)
        MultiTokenPayout payoutFlux = new MultiTokenPayout();

        console.log(
            address(payoutFlux),
            "payoutFlux"
        );

        console.log(
            "Admin address:",
            payoutFlux.admin()
        );

        vm.stopBroadcast();
    }
}