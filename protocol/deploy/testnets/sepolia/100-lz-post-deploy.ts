import { ethers } from 'hardhat';
import { FakeOFT__factory, TcMav__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS, DEPLOY_CONSTANTS } from "../deploy-addresses";
import {
    mine,
    ensureExpectedEnvvars,
    packLayerZeroTrustedRemote,
} from '../../helpers';

async function main() {
    ensureExpectedEnvvars();
    const [owner] = await ethers.getSigners();
    const mavToken = FakeOFT__factory.connect(DEPLOYED_CONTRACTS.sepolia.maverick.MAV_TOKEN, owner);
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.sepolia.tomcat.TC_MAV_TOKEN, owner);

    // @note Testnet only
    // Set trusted remote for MAV
    {
        // Approve the remote zkSyncTestnet testnet version of tcMAV to call this address.
        const lzTrustedRemote = packLayerZeroTrustedRemote(
            DEPLOYED_CONTRACTS.zkSyncTestnet.maverick.MAV_TOKEN,
            mavToken.address
        );

        console.log(`packLayerZeroTrustedRemote(${DEPLOYED_CONTRACTS.zkSyncTestnet.maverick.MAV_TOKEN}, ${mavToken.address}`);
        console.log(`lzTrustedRemote=${lzTrustedRemote}`);
        console.log(`mavToken.setTrustedRemote(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet}, ${lzTrustedRemote})`);
        await mine(mavToken.setTrustedRemote(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet, lzTrustedRemote));
    }

    // Set trusted remote for tcMAV
    {
        // Approve the remote zkSyncTestnet testnet version of tcMAV to call this address.
        const lzTrustedRemote = packLayerZeroTrustedRemote(
            DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TC_MAV_TOKEN,
            tcMavToken.address
        );

        console.log(`packLayerZeroTrustedRemote(${DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TC_MAV_TOKEN}, ${tcMavToken.address}`);
        console.log(`lzTrustedRemote=${lzTrustedRemote}`);
        console.log(`tcMavToken.setTrustedRemote(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet}, ${lzTrustedRemote})`);
        await mine(tcMavToken.setTrustedRemote(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet, lzTrustedRemote));
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