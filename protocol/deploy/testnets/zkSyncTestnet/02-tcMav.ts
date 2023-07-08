import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployAndMineZk, getZkWallet } from "../../helpers";
import { TcMav__factory } from "../../../typechain";
import { DEPLOY_CONSTANTS } from "../deploy-addresses";
import { network } from 'hardhat';

export default async function (hre: HardhatRuntimeEnvironment) {
    const owner = getZkWallet();

    const factory = new TcMav__factory(owner);
    await deployAndMineZk(
        `${network.name}.maverick.TC_MAV_TOKEN`,
        owner, hre, 
        "TcMav",
        factory.deploy,
        DEPLOY_CONSTANTS.LAYER_ZERO.ENDPOINTS.zkSyncTestnet
    );
}
