// SPDX-License-Identifier: -- ETH --
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ISparkFarm {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function exit() external;
    function getReward() external;
    function stakedToken() external view returns (address);
    function rewardToken() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
}

contract SparkFarmManager is Ownable {
    using SafeERC20 for IERC20;

    ISparkFarm public immutable sparkFarm;
    IERC20 public immutable stakedToken;

    constructor(
        address _sparkFarmAddress
    )
        Ownable(msg.sender)
    {
        if (_sparkFarmAddress == address(0)) {
            revert("Farm address cannot be zero");
        }

        sparkFarm = ISparkFarm(
            _sparkFarmAddress
        );

        stakedToken = IERC20(
            sparkFarm.stakedToken()
        );
    }

    /**
     * @notice Stakes tokens into the Spark Farm.
     * @dev This function pulls tokens from the `msg.sender` (who must be the owner)
     * and stakes them into the farm. The contract itself becomes the staker.
     * @param _amount The amount of stakedToken to stake.
     */
    function stake(uint256 _amount) external onlyOwner {
        stakedToken.safeTransferFrom(msg.sender, address(this), _amount);
        stakedToken.approve(address(sparkFarm), _amount);
        sparkFarm.stake(_amount);
    }

    /**
     * @notice Withdraws a specified amount of staked tokens from the farm.
     * @dev The withdrawn tokens are held in this contract, to be distributed by the owner.
     * @param _amount The amount of stakedToken to withdraw.
     */
    function withdraw(uint256 _amount) external onlyOwner {
        sparkFarm.withdraw(_amount);
    }

    /**
     * @notice Claims pending rewards from the farm.
     * @dev The claimed reward tokens are held in this contract, to be distributed by the owner.
     */
    function claimRewards() external onlyOwner {
        sparkFarm.getReward();
    }

    /**
     * @notice Withdraws all staked tokens and claims all pending rewards from the farm.
     * @dev All withdrawn funds (staked + rewards) are held in this contract for distribution.
     */
    function exitFarm() external onlyOwner {
        sparkFarm.exit();
    }

    /**
     * @notice Helper view function to see this contract's staked balance in the farm.
     */
    function getStakedBalance() external view returns (uint256) {
        return sparkFarm.balanceOf(address(this));
    }
}
