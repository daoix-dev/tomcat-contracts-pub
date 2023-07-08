pragma solidity 0.8.18;
// SPDX-License-Identifier: AGPL-3.0

import { OFT } from "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";

contract FakeOFT is OFT {
    // solhint-disable-next-line no-empty-blocks
    constructor(string memory _name, string memory _symbol, address _layerZeroEndpoint)
        OFT(_name, _symbol, _layerZeroEndpoint)
    // solhint-disable-next-line no-empty-blocks
    {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) external {
        _burn(account, amount);
    }
}
