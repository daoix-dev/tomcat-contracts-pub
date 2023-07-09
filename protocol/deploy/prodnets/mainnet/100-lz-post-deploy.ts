import { ethers } from 'hardhat';
import { TcMav__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS, DEPLOY_CONSTANTS } from "../deploy-addresses";
import {
    mine,
    ensureExpectedEnvvars,
    packLayerZeroTrustedRemote,
} from '../../helpers';

async function main() {
    ensureExpectedEnvvars();
    const [owner] = await ethers.getSigners();
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.mainnet.tomcat.TC_MAV_TOKEN, owner);

    // Set trusted remote for tcMAV
    {
        // Approve the remote zkSyncMainnet testnet version of tcMAV to call this address.
        const lzTrustedRemote = packLayerZeroTrustedRemote(
            DEPLOYED_CONTRACTS.zkSyncMainnet.tomcat.TC_MAV_TOKEN,
            tcMavToken.address
        );

        console.log(`packLayerZeroTrustedRemote(${DEPLOYED_CONTRACTS.zkSyncMainnet.tomcat.TC_MAV_TOKEN}, ${tcMavToken.address}`);
        console.log(`lzTrustedRemote=${lzTrustedRemote}`);
        console.log(`tcMavToken.setTrustedRemote(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncMainnet}, ${lzTrustedRemote})`);
        await mine(tcMavToken.setTrustedRemote(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncMainnet, lzTrustedRemote));
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