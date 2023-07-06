import { ethers } from 'hardhat';
import {
  deployAndMine,
  ensureExpectedEnvvars,
} from '../helpers';
import { FakeErc20__factory } from '../../../typechain';

async function main() {
  ensureExpectedEnvvars();
  const [owner] = await ethers.getSigners();

  const factory = new FakeErc20__factory(owner);
  await deployAndMine(
    'MAV_TOKEN', factory, factory.deploy,
    "Maverick Token", "MAV",
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