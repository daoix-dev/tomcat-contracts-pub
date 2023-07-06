pragma solidity 0.8.18;
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeErc20 is ERC20 {
    // solhint-disable-next-line no-empty-blocks
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) external {
        _burn(account, amount);
    }
}
