import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getZkWallet, mine } from "../../helpers";
import { TcMav__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS, DEPLOY_CONSTANTS } from "../deploy-addresses";

export default async function (hre: HardhatRuntimeEnvironment) {
    const owner = getZkWallet();
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.zkSyncMainnet.tomcat.TC_MAV_TOKEN, owner);

    // Add tcMAV mint rights to the launch vault
    {
        console.log(`tcMavToken.setMinter(${DEPLOYED_CONTRACTS.zkSyncMainnet.tomcat.TOMCAT_LAUNCH_VAULT}, true)`);
        await mine(tcMavToken.setMinter(DEPLOYED_CONTRACTS.zkSyncMainnet.tomcat.TOMCAT_LAUNCH_VAULT, true));
    }

    // Setup LZ for tcMAV
    {
        // Allows us to set a min amount of gas required (otherwise defaults to 200k min making it more expensive for users)
        console.log(`tcMavToken.setUseCustomAdapterParams(true)`);
        await mine(tcMavToken.setUseCustomAdapterParams(true));

        // @todo get this value
        const requiredMinGasOnSepolia = 1200254;
        console.log(`tcMavToken.setMinDstGas(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.mainnet}, 0, ${requiredMinGasOnSepolia})`);
        await mine(tcMavToken.setMinDstGas(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.mainnet, 0, requiredMinGasOnSepolia));
    }

}
