import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getZkWallet, mine } from "../../helpers";
import { FakeOFT__factory, TcMav__factory, TomcatLaunchVault__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS } from "../deploy-addresses";
import { ethers } from "ethers";

export default async function (hre: HardhatRuntimeEnvironment) {
    const owner = getZkWallet();
    const ownerAddress = await owner.getAddress();
    const mavToken = FakeOFT__factory.connect(DEPLOYED_CONTRACTS.zkSyncTestnet.maverick.MAV_TOKEN, owner);
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TC_MAV_TOKEN, owner);
    const launchVault = TomcatLaunchVault__factory.connect(DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TOMCAT_LAUNCH_VAULT, owner);

    // Stake into the vault
    {
        const convertAmount = ethers.utils.parseEther("10000");
        await mine(mavToken.mint(ownerAddress, convertAmount));
        await mine(mavToken.approve(launchVault.address, convertAmount));
        await mine(launchVault.stake(convertAmount));
        console.log("MAV balance:", ethers.utils.formatEther(await mavToken.balanceOf(ownerAddress)));
        console.log("tcMAV balance:", ethers.utils.formatEther(await tcMavToken.balanceOf(ownerAddress)));
    }
}
