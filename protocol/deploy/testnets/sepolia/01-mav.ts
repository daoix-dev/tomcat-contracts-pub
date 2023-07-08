import { ethers } from 'hardhat';
import {
    deployAndMine,
    ensureExpectedEnvvars,
} from '../../helpers';
import { FakeOFT__factory } from '../../../typechain';
import { DEPLOY_CONSTANTS } from '../deploy-addresses';
import { network } from 'hardhat';

async function main() {
    ensureExpectedEnvvars();
    const [owner] = await ethers.getSigners();

    const factory = new FakeOFT__factory(owner);
    await deployAndMine(
        `${network.name}.maverick.MAV_TOKEN`,
        factory, factory.deploy,
        "Maverick Token",
        "MAV",
        DEPLOY_CONSTANTS.LAYER_ZERO.ENDPOINTS.sepolia
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