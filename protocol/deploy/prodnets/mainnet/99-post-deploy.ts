import { ethers } from 'hardhat';
import { TcMav__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS, DEPLOY_CONSTANTS } from "../deploy-addresses";
import {
    mine,
    ensureExpectedEnvvars,
} from '../../helpers';

async function main() {
    ensureExpectedEnvvars();
    const [owner] = await ethers.getSigners();
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.mainnet.tomcat.TC_MAV_TOKEN, owner);

    // Add tcMAV mint rights to the launch vault
    {
        console.log(`tcMavToken.setMinter(${DEPLOYED_CONTRACTS.mainnet.tomcat.TOMCAT_LAUNCH_VAULT}, true)`);
        await mine(tcMavToken.setMinter(DEPLOYED_CONTRACTS.mainnet.tomcat.TOMCAT_LAUNCH_VAULT, true));
    }

    // @todo later when we deploy zksync
    // // Setup LZ for tcMAV
    // {
    //     // Allows us to set a min amount of gas required (otherwise defaults to 200k min making it more expensive for users)
    //     console.log(`tcMavToken.setUseCustomAdapterParams(true)`);
    //     await mine(tcMavToken.setUseCustomAdapterParams(true));

    //     // @todo get this value
    //     const requiredMinGasOnZkSync = 1200254;
    //     console.log(`tcMavToken.setMinDstGas(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncMainnet}, 0, ${requiredMinGasOnZkSync})`);
    //     await mine(tcMavToken.setMinDstGas(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncMainnet, 0, requiredMinGasOnZkSync));
    // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });