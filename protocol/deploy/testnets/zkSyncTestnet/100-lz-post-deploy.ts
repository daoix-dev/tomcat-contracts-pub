import { HardhatRuntimeEnvironment } from "hardhat/types";
import { packLayerZeroTrustedRemote, getZkWallet, mine } from "../../helpers";
import { FakeOFT__factory, TcMav__factory } from "../../../typechain";
import { DEPLOYED_CONTRACTS, DEPLOY_CONSTANTS } from "../deploy-addresses";

export default async function (hre: HardhatRuntimeEnvironment) {
    const owner = getZkWallet();
    const mavToken = FakeOFT__factory.connect(DEPLOYED_CONTRACTS.zkSyncTestnet.maverick.MAV_TOKEN, owner);
    const tcMavToken = TcMav__factory.connect(DEPLOYED_CONTRACTS.zkSyncTestnet.tomcat.TC_MAV_TOKEN, owner);

    // @note Testnet only
    // Set trusted remote for MAV
    {
        // Approve the remote sepolia testnet version of tcMAV to call this address.
        const lzTrustedRemote = packLayerZeroTrustedRemote(
            DEPLOYED_CONTRACTS.sepolia.maverick.MAV_TOKEN,
            mavToken.address
        );

        console.log(`packLayerZeroTrustedRemote(${DEPLOYED_CONTRACTS.sepolia.maverick.MAV_TOKEN}, ${mavToken.address}`);
        console.log(`lzTrustedRemote=${lzTrustedRemote}`);
        console.log(`mavToken.setTrustedRemote(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.sepolia}, ${lzTrustedRemote})`);
        await mine(mavToken.setTrustedRemote(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.sepolia, lzTrustedRemote));
    }

    // Set trusted remote for tcMAV
    {
        // Approve the remote sepolia testnet version of tcMAV to call this address.
        const lzTrustedRemote = packLayerZeroTrustedRemote(
            DEPLOYED_CONTRACTS.sepolia.tomcat.TC_MAV_TOKEN,
            tcMavToken.address
        );

        console.log(`packLayerZeroTrustedRemote(${DEPLOYED_CONTRACTS.sepolia.tomcat.TC_MAV_TOKEN}, ${tcMavToken.address}`);
        console.log(`lzTrustedRemote=${lzTrustedRemote}`);
        console.log(`tcMavToken.setTrustedRemote(${DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.sepolia}, ${lzTrustedRemote})`);
        await mine(tcMavToken.setTrustedRemote(DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.sepolia, lzTrustedRemote));
    }
}
