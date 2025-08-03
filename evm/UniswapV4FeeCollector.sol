// SPDX-License-Identifier: -- ETH --
pragma solidity ^0.8.24;

import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UniswapV4FeeCollector is Ownable, IERC721Receiver {
    using CurrencyLibrary for Currency;

    /// @notice The immutable address of the Uniswap V4 Position Manager.
    IPositionManager public immutable positionManager;

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

    /**
     * @notice Sets the address of the Uniswap V4 Position Manager upon deployment.
     * @param _positionManagerAddress The address of the deployed IPositionManager contract.
     */
    constructor(address _positionManagerAddress) Ownable(msg.sender) {
        if (_positionManagerAddress == address(0)) {
            revert("Position manager address cannot be zero");
        }
        positionManager = IPositionManager(_positionManagerAddress);
    }

    /**
     * @notice Collects fees from multiple Uniswap V4 positions in a single batch transaction.
     * @dev In Uniswap V4, fee collection is achieved by calling `decreaseLiquidity` with a liquidity amount of 0.
     * This function constructs a batched call to `modifyLiquidities` on the PositionManager.
     * @param positions An array of `CollectParams` structs, each defining a position to collect fees from.
     * @notice Important: For each position, the owner of the `tokenId` must have first called `approve()`
     * on the PositionManager NFT contract, granting this collector contract permission to manage the token.
     */
    function collectFeesInBulk(CollectParams[] calldata positions) external {
        uint256 numPositions = positions.length;
        if (numPositions == 0) {
            revert("Positions array cannot be empty");
        }

        uint256 totalActions = numPositions * 2;
        bytes memory actions = new bytes(totalActions);
        bytes[] memory params = new bytes[](totalActions);

        for (uint256 i = 0; i < numPositions; ++i) {
            CollectParams calldata pos = positions[i];
            uint256 actionIndex = i * 2;

            actions[actionIndex] = bytes1(uint8(Actions.DECREASE_LIQUIDITY));
            params[actionIndex] = abi.encode(pos.tokenId, 0, 0, 0, "");

            actions[actionIndex + 1] = bytes1(uint8(Actions.TAKE_PAIR));
            Currency currency0 = Currency.wrap(pos.token0);
            Currency currency1 = Currency.wrap(pos.token1);
            params[actionIndex + 1] = abi.encode(currency0, currency1, pos.recipient);
        }

        positionManager.modifyLiquidities(abi.encode(actions, params), block.timestamp + 300);
    }

    /**
     * @notice Closes multiple Uniswap V4 positions in a single batch transaction.
     * @dev "Closing" involves withdrawing all liquidity, collecting all fees, and burning the position NFT.
     * This function constructs a batched call to `modifyLiquidities` on the PositionManager.
     * @param positions An array of `CloseParams` structs, each defining a position to close.
     * @notice Important: The caller is responsible for providing the exact `liquidity` amount for each position.
     * This can be queried from the `positionManager.positions(tokenId)` view function.
     * The owner of the `tokenId` must have also approved this contract to manage the token.
     */
    function closePositionsInBulk(CloseParams[] calldata positions) external {
        uint256 numPositions = positions.length;
        if (numPositions == 0) {
            revert("Positions array cannot be empty");
        }

        uint256 totalActions = numPositions * 3;
        bytes memory actions = new bytes(totalActions);
        bytes[] memory params = new bytes[](totalActions);

        for (uint256 i = 0; i < numPositions; ++i) {
            CloseParams calldata pos = positions[i];
            uint256 actionIndex = i * 3;

            // --- Action 1: DECREASE_LIQUIDITY ---
            // Withdraws all liquidity from the position and collects accrued fees.
            actions[actionIndex] = bytes1(uint8(Actions.DECREASE_LIQUIDITY));
            params[actionIndex] = abi.encode(
                pos.tokenId,
                pos.liquidity, // The full liquidity of the position
                0, // amount0Min = 0 (slippage not a concern for full withdrawal)
                0, // amount1Min = 0
                "" // hookData
            );

            // --- Action 2: TAKE_PAIR ---
            // Transfers the withdrawn liquidity and fees to the recipient.
            actions[actionIndex + 1] = bytes1(uint8(Actions.TAKE_PAIR));
            Currency currency0 = Currency.wrap(pos.token0);
            Currency currency1 = Currency.wrap(pos.token1);
            params[actionIndex + 1] = abi.encode(currency0, currency1, pos.recipient);

            // --- Action 3: BURN ---
            // Burns the position NFT, as it is now empty.
            actions[actionIndex + 2] = bytes1(uint8(Actions.BURN_POSITION));
            params[actionIndex + 2] = abi.encode(pos.tokenId);
        }

        positionManager.modifyLiquidities(abi.encode(actions, params), block.timestamp + 300);
    }


    /**
     * @notice Allows the owner to withdraw any ERC20 tokens accidentally sent to this contract.
     * @param token The address of the ERC20 token to withdraw.
     * @param to The address to send the tokens to.
     * @param amount The amount of tokens to withdraw.
     */
    function withdrawTokens(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    /**
     * @dev Implementation of the IERC721Receiver interface. This allows the contract
     * to safely receive NFTs, although the primary design is to act as an operator
     * without holding the NFTs.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
