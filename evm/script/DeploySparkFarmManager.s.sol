// SPDX-License-Identifier: -- BCOM --

pragma solidity ^0.8.24;

import "forge-std/Script.sol";

import "../src/SparkFarmManager.sol";

contract DeploySparkFarmManager is Script {

    function setUp() public {}

    function run() public {

        vm.startBroadcast(
            vm.envUint("PRIVATE_KEY")
        );

        // Spark Farm address - replace with actual deployed farm address
        address sparkFarmAddress = 0x173e314C7635B45322cd8Cb14f44b312e079F3af; // TODO: Update this address

        SparkFarmManager sparkFarmManager = new SparkFarmManager(
            sparkFarmAddress
        );

        console.log(
            address(sparkFarmManager),
            "sparkFarmManager"
        );

        vm.stopBroadcast();
    }
}