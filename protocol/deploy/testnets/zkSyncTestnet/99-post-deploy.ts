import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getZkWallet, mine } from "../../helpers";
import { FakeOFT__factory, TcMav__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS, DEPLOY_CONSTANTS } from "../deploy-addresses";

export default async function (hre: HardhatRuntimeEnvironment) {
    const owner = getZkWallet();
    const ownerAddress = await owner.getAddress();
    const mavToken = FakeOFT__factory.connect(DEPLOYED_CONTRACTS.zkSyncTestnet.maverick.MAV_TOKEN, owner);
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TC_MAV_TOKEN, owner);

    // @note Testnet only
    {
        console.log(`tcMavToken.setMinter(${ownerAddress}, true)`);
        await mine(tcMavToken.setMinter(ownerAddress, true));
    }

    // Add tcMAV mint rights to the launch vault
    {
        console.log(`tcMavToken.setMinter(${DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TOMCAT_LAUNCH_VAULT}, true)`);
        await mine(tcMavToken.setMinter(DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TOMCAT_LAUNCH_VAULT, true));
    }

    // @note Testnet only
    // Setup LZ for MAV
    {
        // Allows us to set a min amount of gas required (otherwise defaults to 200k min making it more expensive for users)
        console.log(`mavToken.setUseCustomAdapterParams(true)`);
        await mine(mavToken.setUseCustomAdapterParams(true));

        // @todo get this value
        const requiredMinGasOnSepolia = 1200254;
        console.log(`mavToken.setMinDstGas(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.sepolia}, 0, ${requiredMinGasOnSepolia})`);
        await mine(mavToken.setMinDstGas(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.sepolia, 0, requiredMinGasOnSepolia));
    }

    // Setup LZ for tcMAV
    {
        // Allows us to set a min amount of gas required (otherwise defaults to 200k min making it more expensive for users)
        console.log(`tcMavToken.setUseCustomAdapterParams(true)`);
        await mine(tcMavToken.setUseCustomAdapterParams(true));

        // @todo get this value
        const requiredMinGasOnSepolia = 1200254;
        console.log(`tcMavToken.setMinDstGas(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.sepolia}, 0, ${requiredMinGasOnSepolia})`);
        await mine(tcMavToken.setMinDstGas(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.sepolia, 0, requiredMinGasOnSepolia));
    }

}
