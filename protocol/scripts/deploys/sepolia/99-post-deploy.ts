import { ethers } from 'hardhat';
import {
    ensureExpectedEnvvars,
    mine,
} from '../helpers';
import { TcMav__factory } from '../../../typechain';
import { DEPLOYED_CONTRACTS } from './contract-addresses';

async function main() {
    ensureExpectedEnvvars();
    const [owner] = await ethers.getSigners();

    // Set the Tomcat Launch Vault as a valid minter of tcMAV
    const tcMav = TcMav__factory.connect(DEPLOYED_CONTRACTS.tomcat.TC_MAV_TOKEN, owner);
    await mine(tcMav.setMinter(DEPLOYED_CONTRACTS.tomcat.TOMCAT_LAUNCH_VAULT, true));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
