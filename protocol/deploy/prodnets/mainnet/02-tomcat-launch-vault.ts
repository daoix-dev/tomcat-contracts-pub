import { ethers } from 'hardhat';
import {
    deployAndMine,
    ensureExpectedEnvvars,
} from '../../helpers';
import { TomcatLaunchVault__factory } from '../../../typechain';
import { DEPLOYED_CONTRACTS } from '../deploy-addresses';
import { network } from 'hardhat';

async function main() {
    ensureExpectedEnvvars();
    const [owner] = await ethers.getSigners();

    // Tue Jul 25 2023 00:00:00 GMT+0000
    const vaultClosingTime = 1690243200;

    const factory = new TomcatLaunchVault__factory(owner);
    await deployAndMine(
        `${network.name}.tomcat.TOMCAT_LAUNCH_VAULT`,
        factory, factory.deploy,
        DEPLOYED_CONTRACTS.mainnet.maverick.MAV_TOKEN, 
        DEPLOYED_CONTRACTS.mainnet.tomcat.TC_MAV_TOKEN,
        vaultClosingTime
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });