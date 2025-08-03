// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Forward declaration of manager contracts and their structs
interface IUniswapV4Manager {
    struct CollectParams {
        uint256 tokenId;
        address recipient;
        address token0;
        address token1;
    }
    struct CloseParams {
        uint256 tokenId;
        address recipient;
        address token0;
        address token1;
        uint128 liquidity;
    }
    function collectFeesInBulk(CollectParams[] calldata positions) external;
    function closePositionsInBulk(CloseParams[] calldata positions) external;
}

interface ISparkFarmManager {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claimRewards() external;
    function exitFarm() external;
    function stakedToken() external view returns (address);
}

/**
 * @title DeFiPortfolioManager
 * @author Vitalik Marincenko
 * @notice A master contract to manage positions across multiple DeFi protocols (Uniswap V4, Spark Farm)
 * through dedicated sub-manager contracts.
 * @dev This contract owns and orchestrates calls to protocol-specific manager contracts,
 * allowing for batched, cross-protocol portfolio management.
 */
contract DeFiPortfolioManager is Ownable {
    using SafeERC20 for IERC20;

    /// @notice The address of the Uniswap V4 Manager contract.
    IUniswapV4Manager public immutable uniswapManager;
    /// @notice The address of the Spark Farm Manager contract.
    ISparkFarmManager public immutable sparkManager;

    /**
     * @notice Sets the addresses of the sub-manager contracts.
     * @param _uniswapManagerAddress The deployed Uniswap V4 Manager contract address.
     * @param _sparkManagerAddress The deployed Spark Farm Manager contract address.
     */
    constructor(
        address _uniswapManagerAddress,
        address _sparkManagerAddress
    ) Ownable(msg.sender) {
        if (_uniswapManagerAddress == address(0) || _sparkManagerAddress == address(0)) {
            revert("Manager addresses cannot be zero");
        }
        uniswapManager = IUniswapV4Manager(_uniswapManagerAddress);
        sparkManager = ISparkFarmManager(_sparkManagerAddress);
    }

    /**
     * @notice Collects all pending fees from specified Uniswap V4 positions and the Spark Farm.
     * @param uniswapPositions An array of parameters for each Uniswap position to collect from.
     */
    function collectAllFees(
        IUniswapV4Manager.CollectParams[] calldata uniswapPositions
    ) external onlyOwner {
        // Collect fees from Uniswap V4 positions
        if (uniswapPositions.length > 0) {
            uniswapManager.collectFeesInBulk(uniswapPositions);
        }

        // Claim rewards from Spark Farm
        sparkManager.claimRewards();
    }

    /**
     * @notice Exits all specified Uniswap V4 positions and the entire Spark Farm position.
     * @param uniswapPositions An array of parameters for each Uniswap position to close.
     */
    function exitAllPositions(
        IUniswapV4Manager.CloseParams[] calldata uniswapPositions
    ) external onlyOwner {
        // Close all specified Uniswap V4 positions
        if (uniswapPositions.length > 0) {
            uniswapManager.closePositionsInBulk(uniswapPositions);
        }

        // Exit the Spark Farm position completely
        sparkManager.exitFarm();
    }

    /**
     * @notice A pass-through function to stake tokens in the Spark Farm via the manager.
     * @dev The owner must first send the stakable tokens to the SparkFarmManager contract.
     * @param _amount The amount of tokens to stake.
     */
    function stakeInSparkFarm(uint256 _amount) external onlyOwner {
        // Before calling this, the owner should transfer the stakeable tokens
        // directly to the SparkFarmManager contract address.
        sparkManager.stake(_amount);
    }

    /**
     * @notice Allows the owner to withdraw any ERC20 tokens held by THIS master contract.
     * @param _token The address of the ERC20 token to withdraw.
     * @param _to The address to send the tokens to.
     * @param _amount The amount of tokens to withdraw.
     */
    function withdrawTokens(address _token, address _to, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(_to, _amount);
    }
}
