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

    // Bridge MAV
    {
        const bridgeAmount = ethers.utils.parseEther("2500");
        await mine(mavToken.mint(ownerAddress, bridgeAmount));

        console.log("Before bridging:");
        console.log("MAV balance:", await mavToken.balanceOf(ownerAddress));
        console.log("tcMAV balance:", await tcMavToken.balanceOf(ownerAddress));

        // Min gas expected to be used
        // @todo work out how to estimate the correct amount....call estimate on the destination chain?
        const adapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 1200254]);

        // @todo This is failing in testnet. likely infra issues.
        const fees = await mavToken.estimateSendFee(
            DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet, 
            ownerAddress,
            bridgeAmount, 
            false, 
            adapterParams
        );
        console.log(`fees[0] (wei): ${fees[0]} / (eth): ${ethers.utils.formatEther(fees[0])}`);

        await mine(mavToken.sendFrom(
            ownerAddress,
            DEPLOY_CONSTANTS.LAYER_ZERO.CHAINIDS.zkSyncTestnet, 
            ownerAddress, 
            bridgeAmount, 
            ownerAddress,
            ethers.constants.AddressZero,
            adapterParams,
            { value: fees[0]})
        );

        console.log("After bridging:");
        console.log("MAV balance:", await mavToken.balanceOf(ownerAddress));
        console.log("tcMAV balance:", await tcMavToken.balanceOf(ownerAddress));
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
