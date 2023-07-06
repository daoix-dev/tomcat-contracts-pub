pragma solidity 0.8.18;
// SPDX-License-Identifier: AGPL-3.0-or-later
// Tomcat (interfaces/core/TcMav.sol)

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

interface ITcMav is IERC20, IERC20Permit {
    event MinterSet(address indexed account, bool canMint);

    error NotMinter();
    error InvalidAddress();

    /**
     * @notice A set of Tomcat addresses which are approved to mint/burn
     * the tcMAV token
     */
    function minters(address account) external view returns (bool canMint);

    /**
     * @notice Set whether an account can mint/burn this tcMAV token
     */
    function setMinter(address account, bool canMint) external;

    /**
     * @notice Creates `amount` tcMAV tokens and assigns them to `account`, increasing
     * the total supply.
     */
    function mint(address recipient, uint256 amount) external;

    /**
     * @notice Destroys `amount` tcMAV tokens from `account`, reducing the
     * total supply.
     */
    function burn(address from, uint256 amount) external;
}
