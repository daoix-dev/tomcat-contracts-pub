pragma solidity 0.8.18;
// SPDX-License-Identifier: AGPL-3.0-or-later
// Tomcat (core/TcMav.sol)

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ITcMav } from "contracts/interfaces/core/ITcMav.sol";

/**
 * @title tcMAV - Tomcat Finance liquid veMAV
 * 
 * @notice tcMAV is an ERC20, a liquid/transferrable receipt token for
 * MAV that is deposited into Tomcat Finance.
 */
contract TcMav is ERC20Permit, Ownable, ITcMav {
    /**
     * @notice A set of Tomcat addresses which are approved to mint/burn
     * the tcMAV token
     */
    mapping(address => bool) public override minters;

    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
        ERC20Permit(_name)
        Ownable()
    // solhint-disable-next-line no-empty-blocks
    { }

    /**
     * @notice Set whether an account can mint/burn this tcMAV token
     */
    function setMinter(address account, bool canMint) external override onlyOwner {
        if (account == address(0)) revert InvalidAddress();
        minters[account] = canMint;
        emit MinterSet(account, canMint);
    }

    /**
     * @notice Creates `amount` tcMAV tokens and assigns them to `account`, increasing
     * the total supply.
     */
    function mint(address recipient, uint256 amount) external override onlyMinters {
        _mint(recipient, amount);
    }

    /**
     * @notice Destroys `amount` tcMAV tokens from `account`, reducing the
     * total supply.
     */
    function burn(address from, uint256 amount) external override onlyMinters {
        _burn(from, amount);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyMinters() {
        if (!minters[msg.sender]) revert NotMinter();
        _;
    }
}
