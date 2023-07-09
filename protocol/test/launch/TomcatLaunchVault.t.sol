pragma solidity 0.8.18;
// SPDX-License-Identifier: AGPL-3.0

import { Test } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { TomcatLaunchVault } from "contracts/launch/TomcatLaunchVault.sol";
import { TcMav } from "contracts/core/TcMav.sol";
import { FakeOFT } from "contracts/test/FakeOFT.sol";
import { ITomcatLaunchLocker } from "contracts/interfaces/launch/ITomcatLaunchLocker.sol";

/* solhint-disable func-name-mixedcase, contract-name-camelcase, not-rely-on-time */

contract MockTomcatLaunchLocker is ITomcatLaunchLocker {
    using SafeERC20 for IERC20;

    // Maverick's MAV token
    IERC20 public mavToken;

    constructor(address _mavToken) {
        mavToken = IERC20(_mavToken);
    }

    /**
     * @notice Pull the MAV from sender (don't bother locking into veMAV)
     */
    function lock(uint256 amount) external {
        mavToken.safeTransferFrom(msg.sender, address(this), amount);
    }
}

contract TomcatLaunchVaultTestBase is Test {
    FakeOFT public mavToken;
    TcMav public tcMavToken;
    TomcatLaunchVault public launchVault;
    MockTomcatLaunchLocker public locker;

    address public msig = makeAddr("msig");
    address public iceman = makeAddr("iceman");
    address public goose = makeAddr("goose");
    address public lzEndpoint = makeAddr("lzEndpoint");

    // 1 Jun 2023
    uint256 public constant START_TIME = 1_685_577_600;
    uint256 public constant CLOSING_TIME = START_TIME + 100 days;

    function setUp() public {
        vm.warp(START_TIME);
        mavToken = new FakeOFT("MAV", "MAV", lzEndpoint);
        tcMavToken = new TcMav(lzEndpoint);
        launchVault = new TomcatLaunchVault(address(mavToken), address(tcMavToken), CLOSING_TIME);
        launchVault.transferOwnership(msig);

        tcMavToken.setMinter(address(launchVault), true);
        locker = new MockTomcatLaunchLocker(address(mavToken));
    }

    function stake(address account, uint256 amount) internal {
        deal(address(mavToken), account, amount, true);

        vm.startPrank(account);
        mavToken.approve(address(launchVault), amount);
        launchVault.stake(amount);
        vm.stopPrank();
    }
}

contract TomcatLaunchVaultTestAdmin is TomcatLaunchVaultTestBase {
    event ClosingTimestampExtended(uint256 timestamp);
    event LockerSet(address indexed locker);
    event MavLocked(uint256 amount);

    function test_initialization() public {
        assertEq(address(launchVault.mavToken()), address(mavToken));
        assertEq(address(launchVault.tcMavToken()), address(tcMavToken));
        assertEq(launchVault.closingTimestamp(), CLOSING_TIME);
        assertEq(address(launchVault.owner()), msig);
    }

    function test_access_extendClosingTimestamp() public {
        vm.startPrank(iceman);
        vm.expectRevert("Ownable: caller is not the owner");
        launchVault.extendClosingTimestamp(123);
    }

    function test_access_setLocker() public {
        vm.startPrank(iceman);
        vm.expectRevert("Ownable: caller is not the owner");
        launchVault.setLocker(goose);
    }

    function test_access_lockMav() public {
        vm.startPrank(iceman);
        vm.expectRevert("Ownable: caller is not the owner");
        launchVault.lockMav();
    }

    function test_extendClosingTimestamp() public {
        vm.startPrank(msig);

        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.InvalidAmount.selector));
        launchVault.extendClosingTimestamp(CLOSING_TIME-1);

        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.InvalidAmount.selector));
        launchVault.extendClosingTimestamp(CLOSING_TIME);

        // Successfully set
        vm.expectEmit(address(launchVault));
        emit ClosingTimestampExtended(CLOSING_TIME+1);
        launchVault.extendClosingTimestamp(CLOSING_TIME+1);
        assertEq(launchVault.closingTimestamp(), CLOSING_TIME+1);
    }

    function test_setLocker() public {
        vm.startPrank(msig);

        // Invalid address
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.InvalidAddress.selector));
        launchVault.setLocker(address(0));

        // Successfully set
        vm.expectEmit(address(launchVault));
        emit LockerSet(address(locker));
        launchVault.setLocker(address(locker));
        assertEq(address(launchVault.locker()), address(locker));

        // Can't update again
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.LockerAlreadySet.selector));
        launchVault.setLocker(goose);
    }
}

contract TomcatLaunchVaultTestStake is TomcatLaunchVaultTestBase {
    event Stake(address indexed account, uint256 amount);

    function test_stake_failVaultClosed() public {
        vm.startPrank(goose);
        vm.warp(CLOSING_TIME + 1);
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.VaultClosed.selector));
        launchVault.stake(100);
    }

    function test_stake_failBadAmount() public {
        vm.startPrank(goose);
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.InvalidAmount.selector));
        launchVault.stake(0);
    }

    function test_stake_failNotEnoughMav() public {
        vm.startPrank(goose);
        deal(address(mavToken), goose, 1e18, true);
        mavToken.approve(address(launchVault), 5e18);
        vm.expectRevert("ERC20: transfer amount exceeds balance");
        launchVault.stake(5e18);
    }

    function test_stake_success() public {
        uint256 amount = 5e18;
        vm.startPrank(goose);
        deal(address(mavToken), goose, amount, true);
        mavToken.approve(address(launchVault), amount);

        vm.expectEmit(address(launchVault));
        emit Stake(goose, amount);
        launchVault.stake(amount);

        // Goose was minted the amount of tcMAV
        assertEq(tcMavToken.balanceOf(goose), amount);
        assertEq(tcMavToken.totalSupply(), amount);

        // The MAV is now in the vault
        assertEq(mavToken.balanceOf(goose), 0);
        assertEq(mavToken.balanceOf(address(launchVault)), amount);
        assertEq(mavToken.totalSupply(), amount);
    }

    function test_fuzz_stake(uint32 timestamp, uint256 amount) public {
        // amount == 0 tested above
        vm.assume(amount > 0);

        vm.warp(timestamp);
        vm.startPrank(goose);
        deal(address(mavToken), goose, amount, true);
        mavToken.approve(address(launchVault), amount);

        if (timestamp > CLOSING_TIME) {
            vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.VaultClosed.selector));
            launchVault.stake(amount);
        } else {
            vm.expectEmit(address(launchVault));
            emit Stake(goose, amount);
            launchVault.stake(amount);

            // Goose was minted the amount of tcMAV
            assertEq(tcMavToken.balanceOf(goose), amount);
            assertEq(tcMavToken.totalSupply(), amount);

            // The MAV is now in the vault
            assertEq(mavToken.balanceOf(goose), 0);
            assertEq(mavToken.balanceOf(address(launchVault)), amount);
            assertEq(mavToken.totalSupply(), amount);
        }
    }
}

contract TomcatLaunchVaultTestUnstake is TomcatLaunchVaultTestBase {
    event Unstake(address indexed account, uint256 amount);

    function test_unstake_failVaultClosed() public {
        vm.startPrank(goose);
        vm.warp(CLOSING_TIME + 1);
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.VaultClosed.selector));
        launchVault.unstake(100);
    }

    function test_unstake_failBadAmount() public {
        vm.startPrank(goose);
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.InvalidAmount.selector));
        launchVault.unstake(0);
    }

    function test_unstake_failNotEnoughTcMav() public {
        stake(goose, 1e18);

        vm.startPrank(goose);
        tcMavToken.approve(address(launchVault), 5e18);
        vm.expectRevert("ERC20: burn amount exceeds balance");
        launchVault.unstake(5e18);
    }

    function test_unstake_success() public {
        uint256 stakeAmount = 5e18;
        stake(goose, stakeAmount);

        vm.startPrank(goose);
        tcMavToken.approve(address(launchVault), stakeAmount);

        uint256 unstakeAmount = 2e18;
        vm.expectEmit(address(launchVault));
        emit Unstake(goose, unstakeAmount);
        launchVault.unstake(unstakeAmount);

        // Goose was minted the amount of tcMAV
        assertEq(tcMavToken.balanceOf(goose), stakeAmount - unstakeAmount);
        assertEq(tcMavToken.totalSupply(), stakeAmount - unstakeAmount);

        // The MAV is now in the vault
        assertEq(mavToken.balanceOf(goose), unstakeAmount);
        assertEq(mavToken.balanceOf(address(launchVault)), stakeAmount - unstakeAmount);
        assertEq(mavToken.totalSupply(), stakeAmount);
    }
}

contract TomcatLaunchVaultTestLockMav is TomcatLaunchVaultTestBase {
    event MavLocked(uint256 amount);

    function test_lockMav_failVaultStillOpen() public {
        vm.startPrank(msig);
        vm.warp(CLOSING_TIME);
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.VaultNotClosed.selector));
        launchVault.lockMav();
    }

    function test_lockMav_failNoLocker() public {
        vm.startPrank(msig);
        vm.warp(CLOSING_TIME + 1);
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.InvalidAddress.selector));
        launchVault.lockMav();
    }

    function test_lockMav_failNoMav() public {
        vm.startPrank(msig);
        launchVault.setLocker(address(locker));

        vm.warp(CLOSING_TIME + 1);
        vm.expectRevert(abi.encodeWithSelector(TomcatLaunchVault.InvalidAmount.selector));
        launchVault.lockMav();
    }

    function test_lockMav_success() public {
        stake(goose, 5e18);
        stake(iceman, 2.5e18);

        vm.startPrank(msig);
        launchVault.setLocker(address(locker));

        vm.warp(CLOSING_TIME + 1);
        vm.expectEmit(address(launchVault));
        emit MavLocked(7.5e18);
        launchVault.lockMav();

        // Goose and Iceman still have the tcMAV
        assertEq(tcMavToken.balanceOf(goose), 5e18);
        assertEq(tcMavToken.balanceOf(iceman), 2.5e18);
        assertEq(tcMavToken.totalSupply(), 7.5e18);

        // The MAV is now in the vault
        assertEq(mavToken.balanceOf(iceman), 0);
        assertEq(mavToken.balanceOf(goose), 0);
        assertEq(mavToken.balanceOf(address(launchVault)), 0);
        assertEq(mavToken.balanceOf(address(locker)), 7.5e18);
        assertEq(mavToken.totalSupply(), 7.5e18);
    }

    function test_fuzz_combined(uint256 stakeAmount, uint256 unstakeAmount) public {
        vm.assume(stakeAmount > unstakeAmount);
        vm.assume(stakeAmount > 0);
        vm.assume(unstakeAmount > 0);

        // Stake some, wait some days, unstake some
        stake(goose, stakeAmount);
        vm.warp(block.timestamp + 25 days);
        vm.prank(goose);
        launchVault.unstake(unstakeAmount);

        vm.warp(CLOSING_TIME + 1 days);
        vm.startPrank(msig);
        launchVault.setLocker(address(locker));

        uint256 lockedAmount = stakeAmount - unstakeAmount;
        vm.expectEmit(address(launchVault));
        emit MavLocked(lockedAmount);
        launchVault.lockMav();

        // Goose still has the tcMAV
        assertEq(tcMavToken.balanceOf(goose), lockedAmount);
        assertEq(tcMavToken.totalSupply(), lockedAmount);

        // The MAV is now in the vault
        assertEq(mavToken.balanceOf(goose), unstakeAmount);
        assertEq(mavToken.balanceOf(address(launchVault)), 0);
        assertEq(mavToken.balanceOf(address(locker)), lockedAmount);
        assertEq(mavToken.totalSupply(), stakeAmount);
    }
}
