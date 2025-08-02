// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20
 * @dev Interface for the ERC20 standard, including allowance functions.
 */
interface IERC20 {
    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}


contract MultiTokenPayout {
    // The address of the administrator who funds the payouts.
    address public admin;

    /**
     * @dev Event emitted when tokens are successfully claimed.
     * @param claimer The address of the account that claimed the tokens.
     * @param funder The address of the account that funded the claim (the admin).
     */
    event TokensClaimed(address indexed claimer, address indexed funder);

    /**
     * @dev Throws an error if called by any account other than the admin.
     * This is used for administrative functions like changing the funder.
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    /**
     * @dev Sets the deployer of the contract as the admin (the funder).
     */
    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Allows any user to claim multiple ERC20 tokens from the admin's wallet.
     * @dev This function transfers specified amounts of specified tokens from the admin's
     * address to the caller's address (`msg.sender`). The admin must have previously called
     * `approve()` on each token contract to authorize this contract as a spender.
     * @param tokenAddresses An array of ERC20 token contract addresses.
     * @param tokenAmounts An array of the amounts of each token to be claimed.
     * The length of this array must match the length of the tokenAddresses array.
     */
    function claimTokens(
        address[] calldata tokenAddresses,
        uint256[] calldata tokenAmounts
    ) external {
        // Ensure that the number of token addresses matches the number of amounts.
        require(
            tokenAddresses.length == tokenAmounts.length,
            "Input array lengths do not match"
        );

        // Loop through each token and amount to perform the transfer.
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            address tokenAddress = tokenAddresses[i];
            uint256 amount = tokenAmounts[i];

            // Ensure the amount is greater than zero.
            require(amount > 0, "Amount must be greater than zero");

            IERC20 token = IERC20(tokenAddress);

            // Transfer the token amount from the admin to the caller (msg.sender).
            // This requires the admin to have approved this contract as a spender.
            // The `transferFrom` function will automatically check that the admin
            // has a sufficient balance and has granted a sufficient allowance to this contract.
            bool success = token.transferFrom(admin, msg.sender, amount);
            require(success, "Token transfer failed. Ensure admin has approved this contract for the specified amount.");
        }

        // Emit an event to log that the tokens were claimed.
        emit TokensClaimed(msg.sender, admin);
    }

    /**
     * @notice Allows the current admin to transfer the admin role to a new address.
     * @dev The new admin will become the source of funds for future claims.
     * They must also approve the contract on the token contracts.
     * @param newAdmin The address of the new admin.
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "New admin cannot be the zero address");
        admin = newAdmin;
    }
}
