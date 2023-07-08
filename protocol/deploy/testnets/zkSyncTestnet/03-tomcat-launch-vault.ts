import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployAndMineZk, getZkWallet } from "../../helpers";
import { TomcatLaunchVault__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS } from "../deploy-addresses";
import { network } from 'hardhat';

export default async function (hre: HardhatRuntimeEnvironment) {
    const owner = getZkWallet();

    // Tue Jul 25 2023 00:00:00 GMT+0000
    const vaultClosingTime = 1690243200;

    const factory = new TomcatLaunchVault__factory(owner);
    await deployAndMineZk(
        `${network.name}.maverick.TOMCAT_LAUNCH_VAULT`,
        owner, hre, 
        "TomcatLaunchVault",
        factory.deploy,
        DEPLOYED_CONTRACTS.zkSyncTestnet.maverick.MAV_TOKEN, 
        DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TC_MAV_TOKEN,
        vaultClosingTime
    );
}
