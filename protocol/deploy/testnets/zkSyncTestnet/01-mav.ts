import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployAndMineZk, getZkWallet } from "../../helpers";
import { FakeOFT__factory } from "../../../typechain";
import { DEPLOY_CONSTANTS } from "../deploy-addresses";
import { network } from 'hardhat';

export default async function (hre: HardhatRuntimeEnvironment) {
    const owner = getZkWallet();

    const factory = new FakeOFT__factory(owner);
    await deployAndMineZk(
        `${network.name}.maverick.MAV_TOKEN`,
        owner, hre, 
        "FakeOFT",
        factory.deploy,
        "Maverick Token",
        "MAV", 
        DEPLOY_CONSTANTS.LAYER_ZERO.ENDPOINTS.zkSyncTestnet
    );
}
