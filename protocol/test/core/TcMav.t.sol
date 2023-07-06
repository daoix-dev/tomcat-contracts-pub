pragma solidity 0.8.18;
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Test } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { TomcatLaunchVault } from "contracts/launch/TomcatLaunchVault.sol";
import { ITcMav, TcMav } from "contracts/core/TcMav.sol";
import { FakeErc20 } from "contracts/test/FakeErc20.sol";
import { ITomcatLaunchLocker } from "contracts/interfaces/launch/ITomcatLaunchLocker.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/* solhint-disable func-name-mixedcase, contract-name-camelcase, not-rely-on-time */

contract TcMavTestBase is Test {
    TcMav public tcMavToken;

    address public msig = makeAddr("msig");
    address public goose = makeAddr("goose");
    address public iceman = makeAddr("iceman");

    function setUp() public {
        tcMavToken = new TcMav("Tomcat tcMAV", "tcMAV");
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

contract TcMavTestPermit is TcMavTestBase {
    bytes32 private constant _PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );

    bytes32 private constant _TYPE_HASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    function hashTypedData(
        IERC20Metadata permitToken,
        address signer,
        address spender,
        uint256 amount,
        uint256 deadline
    ) internal view returns (bytes32) {
        uint256 _nonce = tcMavToken.nonces(signer);
        bytes32 _hashedName = keccak256(bytes(permitToken.name()));
        bytes32 _hashedVersion = keccak256(bytes("1"));
        bytes32 domainSep = keccak256(
            abi.encode(_TYPE_HASH, _hashedName, _hashedVersion, block.chainid, address(permitToken))
        );

        bytes32 structHash =
            keccak256(abi.encode(_PERMIT_TYPEHASH, signer, spender, amount, _nonce, deadline));
        return ECDSA.toTypedDataHash(domainSep, structHash);
    }

    function sign(
        address signer,
        uint256 signerKey,
        address spender,
        uint256 amount,
        uint256 deadline
    ) internal view returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 digest = hashTypedData(tcMavToken, signer, spender, amount, deadline);

        return vm.sign(signerKey, digest);
    }

    function test_testErc20Permit_failDeadline() public {
        (address signer, uint256 signerKey) = makeAddrAndKey("signer");
        address spender = iceman;
        uint256 amount = 1.25e18;
        uint256 deadline = block.timestamp - 1;

        (uint8 v, bytes32 r, bytes32 s) = sign(signer, signerKey, spender, amount, deadline);

        vm.startPrank(signer);
        vm.expectRevert("ERC20Permit: expired deadline");
        tcMavToken.permit(signer, spender, amount, deadline, v, r, s);
    }

    function test_testErc20Permit_success() public {
        (address signer, uint256 signerKey) = makeAddrAndKey("signer");
        address spender = iceman;
        uint256 amount = 1.25e18;
        uint256 deadline = block.timestamp + 3600;

        (uint8 v, bytes32 r, bytes32 s) = sign(signer, signerKey, spender, amount, deadline);

        deal(address(tcMavToken), signer, amount, true);

        // Spender can't pull tokens - no approval
        {
            vm.startPrank(spender);
            vm.expectRevert("ERC20: insufficient allowance");
            tcMavToken.transferFrom(signer, spender, amount);
        }

        // Permit
        {
            changePrank(signer);
            tcMavToken.permit(signer, spender, amount, deadline, v, r, s);
        }

        // Spender can now pull tokens
        {
            changePrank(spender);
            tcMavToken.transferFrom(signer, spender, amount);

            assertEq(tcMavToken.balanceOf(signer), 0);
            assertEq(tcMavToken.balanceOf(spender), amount);
        }

        // Can't reuse the same signature as before
        {
            vm.expectRevert("ERC20Permit: invalid signature");
            tcMavToken.permit(signer, spender, amount, deadline, v, r, s);
        }
    }
}
