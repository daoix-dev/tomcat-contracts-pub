import { HardhatRuntimeEnvironment } from "hardhat/types";
import { packLayerZeroTrustedRemote, getZkWallet, mine } from "../../helpers";
import { TcMav__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS, DEPLOY_CONSTANTS } from "../deploy-addresses";

export default async function (hre: HardhatRuntimeEnvironment) {
    const owner = getZkWallet();
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.zkSyncMainnet.tomcat.TC_MAV_TOKEN, owner);

    // Set trusted remote for tcMAV
    {
        // Approve the remote sepolia testnet version of tcMAV to call this address.
        const lzTrustedRemote = packLayerZeroTrustedRemote(
            DEPLOYED_CONTRACTS.mainnet.tomcat.TC_MAV_TOKEN,
            tcMavToken.address
        );

        console.log(`packLayerZeroTrustedRemote(${DEPLOYED_CONTRACTS.mainnet.tomcat.TC_MAV_TOKEN}, ${tcMavToken.address}`);
        console.log(`lzTrustedRemote=${lzTrustedRemote}`);
        console.log(`tcMavToken.setTrustedRemote(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.mainnet}, ${lzTrustedRemote})`);
        await mine(tcMavToken.setTrustedRemote(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.mainnet, lzTrustedRemote));
    }
}
