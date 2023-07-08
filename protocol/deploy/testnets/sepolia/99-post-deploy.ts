import { ethers } from 'hardhat';
import { FakeOFT__factory, TcMav__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS, DEPLOY_CONSTANTS } from "../deploy-addresses";
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

    // @note Testnet only
    {
        console.log(`tcMavToken.setMinter(${ownerAddress}, true)`);
        await mine(tcMavToken.setMinter(ownerAddress, true));
    }

    // Add tcMAV mint rights to the launch vault
    {
        console.log(`tcMavToken.setMinter(${DEPLOYED_CONTRACTS.sepolia.tomcat.TOMCAT_LAUNCH_VAULT}, true)`);
        await mine(tcMavToken.setMinter(DEPLOYED_CONTRACTS.sepolia.tomcat.TOMCAT_LAUNCH_VAULT, true));
    }

    // @note Testnet only
    // Setup LZ for MAV
    {
        // Allows us to set a min amount of gas required (otherwise defaults to 200k min making it more expensive for users)
        console.log(`mavToken.setUseCustomAdapterParams(true)`);
        await mine(mavToken.setUseCustomAdapterParams(true));

        // @todo get this value
        const requiredMinGasOnZkSync = 1200254;
        console.log(`mavToken.setMinDstGas(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet}, 0, ${requiredMinGasOnZkSync})`);
        await mine(mavToken.setMinDstGas(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet, 0, requiredMinGasOnZkSync));
    }

    // Setup LZ for tcMAV
    {
        // Allows us to set a min amount of gas required (otherwise defaults to 200k min making it more expensive for users)
        console.log(`tcMavToken.setUseCustomAdapterParams(true)`);
        await mine(tcMavToken.setUseCustomAdapterParams(true));

        // @todo get this value
        const requiredMinGasOnZkSync = 1200254;
        console.log(`tcMavToken.setMinDstGas(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet}, 0, ${requiredMinGasOnZkSync})`);
        await mine(tcMavToken.setMinDstGas(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet, 0, requiredMinGasOnZkSync));
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