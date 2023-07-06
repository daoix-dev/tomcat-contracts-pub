import { ethers } from 'hardhat';
import {
  deployAndMine,
  ensureExpectedEnvvars,
} from '../helpers';
import { TomcatLaunchVault__factory } from '../../../typechain';
import { DEPLOYED_CONTRACTS } from './contract-addresses';

async function main() {
  ensureExpectedEnvvars();
  const [owner] = await ethers.getSigners();

  // Tue Jul 25 2023 00:00:00 GMT+0000
  const vaultClosingTime = 1690243200;

  const factory = new TomcatLaunchVault__factory(owner);
  await deployAndMine(
    'TOMCAT_LAUNCH_VAULT', factory, factory.deploy,
    DEPLOYED_CONTRACTS.maverick.MAV_TOKEN, 
    DEPLOYED_CONTRACTS.tomcat.TC_MAV_TOKEN,
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