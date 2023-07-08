import { ethers } from 'hardhat';
import { FakeOFT__factory, TcMav__factory, TomcatLaunchVault__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS } from "../deploy-addresses";
import {
    mine,
    ensureExpectedEnvvars,
} from '../../helpers';

async function main() {
    ensureExpectedEnvvars();
    const [owner] = await ethers.getSigners();
    const ownerAddress = await owner.getAddress();
    const mavToken = FakeOFT__factory.connect(DEPLOYED_CONTRACTS.sepolia.maverick.MAV_TOKEN, owner);
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.sepolia.tomcat.TC_MAV_TOKEN, owner);
    const launchVault = TomcatLaunchVault__factory.connect(DEPLOYED_CONTRACTS.sepolia.tomcat.TOMCAT_LAUNCH_VAULT, owner);

    // Deposit into the vault
    {
        const convertAmount = ethers.utils.parseEther("10000");
        await mine(mavToken.mint(ownerAddress, convertAmount));
        await mine(mavToken.approve(launchVault.address, convertAmount));
        await mine(launchVault.deposit(convertAmount));
        console.log("MAV balance:", await mavToken.balanceOf(ownerAddress));
        console.log("tcMAV balance:", await tcMavToken.balanceOf(ownerAddress));
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
