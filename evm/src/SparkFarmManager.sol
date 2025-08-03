// SPDX-License-Identifier: -- ETH --
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ISparkFarm {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function exit() external;
    function getReward() external;
    function stakingToken() external view returns (address);
    function rewardsToken() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function earned(address account) external view returns (uint256);
}

contract SparkFarmManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    ISparkFarm public immutable sparkFarm;
    IERC20 public immutable stakedToken;
    IERC20 public immutable rewardToken;

    // Events for better tracking
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event FarmExited(address indexed user, uint256 stakedAmount, uint256 rewardAmount);

    // Custom errors
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance();

    constructor(address _sparkFarmAddress) {
        if (_sparkFarmAddress == address(0)) {
            revert ZeroAddress();
        }

        sparkFarm = ISparkFarm(_sparkFarmAddress);

        address stakedTokenAddr = sparkFarm.stakingToken();
        address rewardTokenAddr = sparkFarm.rewardsToken();

        if (stakedTokenAddr == address(0) || rewardTokenAddr == address(0)) {
            revert ZeroAddress();
        }

        stakedToken = IERC20(stakedTokenAddr);
        rewardToken = IERC20(rewardTokenAddr);
    }

    /**
     * @notice Stakes tokens into the Spark Farm for the caller.
     * @param _amount The amount of stakedToken to stake.
     */
    function stake(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert ZeroAmount();

        stakedToken.safeTransferFrom(msg.sender, address(this), _amount);
        stakedToken.approve(address(sparkFarm), _amount);
        sparkFarm.stake(_amount);

        emit Staked(msg.sender, _amount);
    }

    /**
     * @notice Withdraws a specified amount of staked tokens from the farm.
     * @dev The withdrawn tokens are sent directly to the caller.
     * @param _amount The amount of stakedToken to withdraw.
     */
    function withdraw(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert ZeroAmount();

        uint256 stakedBalance = sparkFarm.balanceOf(address(this));
        if (stakedBalance < _amount) revert InsufficientBalance();

        sparkFarm.withdraw(_amount);
        stakedToken.safeTransfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }

    /**
     * @notice Claims pending rewards from the farm.
     * @dev The claimed reward tokens are sent directly to the caller.
     */
    function claimRewards() external nonReentrant {
        uint256 rewardsBefore = rewardToken.balanceOf(address(this));
        sparkFarm.getReward();
        uint256 rewardsAfter = rewardToken.balanceOf(address(this));

        uint256 claimedAmount = rewardsAfter - rewardsBefore;
        if (claimedAmount > 0) {
            rewardToken.safeTransfer(msg.sender, claimedAmount);
        }

        emit RewardsClaimed(msg.sender, claimedAmount);
    }

    /**
     * @notice Withdraws all staked tokens and claims all pending rewards from the farm.
     * @dev All withdrawn funds (staked + rewards) are sent directly to the caller.
     */
    function exitFarm() external nonReentrant {
        uint256 stakedBalance = sparkFarm.balanceOf(address(this));
        uint256 rewardsBefore = rewardToken.balanceOf(address(this));

        sparkFarm.exit();

        // Send staked tokens to caller
        if (stakedBalance > 0) {
            stakedToken.safeTransfer(msg.sender, stakedBalance);
        }

        // Send rewards to caller
        uint256 rewardsAfter = rewardToken.balanceOf(address(this));
        uint256 claimedRewards = rewardsAfter - rewardsBefore;
        if (claimedRewards > 0) {
            rewardToken.safeTransfer(msg.sender, claimedRewards);
        }

        emit FarmExited(msg.sender, stakedBalance, claimedRewards);
    }

    /**
     * @notice Withdraws staked tokens and claims rewards in one transaction.
     * @param _withdrawAmount The amount of staked tokens to withdraw (0 for rewards only).
     */
    function withdrawAndClaimRewards(uint256 _withdrawAmount) external nonReentrant {
        uint256 rewardsBefore = rewardToken.balanceOf(address(this));

        // Withdraw staked tokens if requested
        if (_withdrawAmount > 0) {
            uint256 stakedBalance = sparkFarm.balanceOf(address(this));
            if (stakedBalance < _withdrawAmount) revert InsufficientBalance();

            sparkFarm.withdraw(_withdrawAmount);
            stakedToken.safeTransfer(msg.sender, _withdrawAmount);
            emit Withdrawn(msg.sender, _withdrawAmount);
        }

        // Claim rewards
        sparkFarm.getReward();
        uint256 rewardsAfter = rewardToken.balanceOf(address(this));
        uint256 claimedAmount = rewardsAfter - rewardsBefore;

        if (claimedAmount > 0) {
            rewardToken.safeTransfer(msg.sender, claimedAmount);
        }

        emit RewardsClaimed(msg.sender, claimedAmount);
    }

    /**
     * @notice Get comprehensive farm status.
     */
    function getFarmStatus() external view returns (
        uint256 stakedInFarm,
        uint256 pendingRewards,
        address stakedTokenAddress,
        address rewardTokenAddress
    ) {
        stakedInFarm = sparkFarm.balanceOf(address(this));
        pendingRewards = sparkFarm.earned(address(this));
        stakedTokenAddress = address(stakedToken);
        rewardTokenAddress = address(rewardToken);
    }
}