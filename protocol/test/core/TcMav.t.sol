pragma solidity 0.8.18;
// SPDX-License-Identifier: AGPL-3.0

import { Test } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { TomcatLaunchVault } from "contracts/launch/TomcatLaunchVault.sol";
import { ITcMav, TcMav } from "contracts/core/TcMav.sol";
// import { FakeOFT } from "contracts/test/FakeOFT.sol";
import { ITomcatLaunchLocker } from "contracts/interfaces/launch/ITomcatLaunchLocker.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/* solhint-disable func-name-mixedcase, contract-name-camelcase, not-rely-on-time */

contract TcMavTestBase is Test {
    TcMav public tcMavToken;

    address public msig = makeAddr("msig");
    address public goose = makeAddr("goose");
    address public iceman = makeAddr("iceman");
    address public lzEndpoint = makeAddr("lzEndpoint");

    function setUp() public {
        tcMavToken = new TcMav(lzEndpoint);
        tcMavToken.transferOwnership(msig);
    }
}

contract TcMavTestAdmin is TcMavTestBase {
    event MinterSet(address indexed account, bool canMint);

    function test_initialization() public {
        assertEq(address(tcMavToken.owner()), msig);
        assertEq(tcMavToken.minters(msig), false);
    }

    function test_access_setMinter() public {
        vm.startPrank(goose);
        vm.expectRevert("Ownable: caller is not the owner");
        tcMavToken.setMinter(goose, true);
    }

    function test_setMinter_badAddress() public {
        vm.startPrank(msig);
        vm.expectRevert(abi.encodeWithSelector(ITcMav.InvalidAddress.selector));
        tcMavToken.setMinter(address(0), true);
    }

    function test_setMinter_success() public {
        vm.startPrank(msig);

        // Set goose as minter
        vm.expectEmit(address(tcMavToken));
        emit MinterSet(goose, true);
        tcMavToken.setMinter(goose, true);
        assertEq(tcMavToken.minters(goose), true);

        // Remove goose as minter
        vm.expectEmit(address(tcMavToken));
        emit MinterSet(goose, false);
        tcMavToken.setMinter(goose, false);
        assertEq(tcMavToken.minters(goose), false);
    }
}

contract TcMavTestMintBurn is TcMavTestBase {
    event Transfer(address indexed from, address indexed to, uint256 value);

    function test_mint_failNotMinter() public {
        vm.startPrank(goose);
        vm.expectRevert(abi.encodeWithSelector(ITcMav.NotMinter.selector));
        tcMavToken.mint(goose, 1e18);
    }

    function test_mint_success() public {
        vm.startPrank(msig);
        tcMavToken.setMinter(msig, true);

        vm.expectEmit(address(tcMavToken));
        emit Transfer(address(0), goose, 5e18);
        tcMavToken.mint(goose, 5e18);

        assertEq(tcMavToken.balanceOf(goose), 5e18);
        assertEq(tcMavToken.totalSupply(), 5e18);
    }

    function test_burn_failNotMinter() public {
        vm.startPrank(goose);
        vm.expectRevert(abi.encodeWithSelector(ITcMav.NotMinter.selector));
        tcMavToken.burn(goose, 1e18);
    }

    function test_burn_success() public {
        vm.startPrank(msig);
        tcMavToken.setMinter(msig, true);

        tcMavToken.mint(goose, 5e18);

        vm.expectEmit(address(tcMavToken));
        emit Transfer(goose, address(0), 2e18);
        tcMavToken.burn(goose, 2e18);

        assertEq(tcMavToken.balanceOf(goose), 3e18);
        assertEq(tcMavToken.totalSupply(), 3e18);
    }
}
