import { BaseContract, BigNumber, ContractFactory, ContractTransaction, ethers } from "ethers";
import { network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';
import { Wallet as ZkWallet, Provider as ZkProvider } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function mine(tx: Promise<ContractTransaction>) {
  console.log(`Mining transaction: ${(await tx).hash}`);
  await (await tx).wait();
}

// BigNumber json serialization override, dump as string
Object.defineProperties(BigNumber.prototype, {
  toJSON: {
    value: function (this: BigNumber) {
      return this.toString();
    },
  },
});

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

/**
 * Typesafe helper that works on contract factories to create, deploy, wait till deploy completes
 * and output useful commands to setup etherscan with contract code
 */
export async function deployAndMine<
  T extends BaseContract,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends (...args: any[]) => Promise<T>
>(
  name: string,
  factory: ContractFactory,
  deploy: D,
  ...args: Parameters<D>
): Promise<T> {
  if (factory.deploy !== deploy) {
    throw new Error("Contract factory and deploy method don't match");
  }

  // Ensure none of the args are empty
  args.forEach((a, i) => {
    if (!(a.toString()))
      throw new Error(`Empty arg in position ${i}`);
  });

  const renderedArgs = JSON.stringify(args, null, 2);

  console.log(`*******Deploying ${name} on ${network.name} with args ${renderedArgs}`);
  const contract = await factory.deploy(...args) as T;
  console.log(`Deployed... waiting for transaction to mine: ${contract.deployTransaction.hash}`);
  console.log();
  await contract.deployed();
  console.log('Contract deployed');
  console.log(`${name}=${contract.address}`);
  console.log(`export ${name}=${contract.address}`);

  const argsPath = `deploy/deploymentArgs/${network.name}/${contract.address}.js`;
  const verifyCommand = `yarn hardhat verify --network ${network.name} ${contract.address} --constructor-args ${argsPath}`;
  ensureDirectoryExistence(argsPath);
  let contents = `// ${network.name}: ${name}=${contract.address}`;
  contents += `\n// ${verifyCommand}`;
  contents += `\nmodule.exports = ${renderedArgs};`;
  fs.writeFileSync(argsPath, contents);

  console.log(verifyCommand);
  console.log('********************\n');

  return contract;
}

export function getZkWallet(): ZkWallet {
  ensureExpectedEnvvars();

  const networkName = network.name.toUpperCase();
  const privateKey = process.env[`${networkName}_ADDRESS_PRIVATE_KEY`]!;
  const rpcUrl = process.env[`${networkName}_RPC_URL`];

  const wallet = new ZkWallet(privateKey);
  const provider = new ZkProvider(rpcUrl);
  return wallet.connect(provider);
}

export async function deployAndMineZk<
  T extends BaseContract,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends (...args: any[]) => Promise<T>
>(
  name: string,
  signer: ZkWallet,
  hre: HardhatRuntimeEnvironment, 
  contractName: string,
  // factory: ContractFactory,
  deploy: D,
  ...args: Parameters<D>
): Promise<T> {
  // if (factory.deploy !== deploy) {
  //   throw new Error("Contract factory and deploy method don't match");
  // }

  // Ensure none of the args are empty
  args.forEach((a, i) => {
    if (!(a.toString()))
      throw new Error(`Empty arg in position ${i}`);
  });

  const renderedArgs = JSON.stringify(args, null, 2);

  const deployer = new Deployer(hre, signer);
  const artifact = await deployer.loadArtifact(contractName);
  const deploymentFee = await deployer.estimateDeployFee(artifact, args);

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.utils.formatEther(deploymentFee);
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  console.log(`*******Deploying ${name} on ${network.name} with args ${renderedArgs}`);
  const contract = await deployer.deploy(artifact, args) as T;
  console.log("Serialized constructor args:" + contract.interface.encodeDeploy(args));

  console.log(`${artifact.contractName} was deployed to ${contract.address}`);
  console.log(`${name}=${contract.address}`);
  console.log(`export ${name}=${contract.address}`);

  const argsPath = `deploy/deploymentArgs/${network.name}/${contract.address}.js`;
  const verifyCommand = `yarn hardhat verify --network ${network.name} ${contract.address} --constructor-args ${argsPath}`;
  ensureDirectoryExistence(argsPath);
  let contents = `// ${network.name}: ${name}=${contract.address}`;
  contents += `\n// ${verifyCommand}`;
  contents += `\nmodule.exports = ${renderedArgs};`;
  fs.writeFileSync(argsPath, contents);

  console.log(verifyCommand);
  console.log('********************\n');

  return contract;
}

const getExpectedEnvVars = (key: string): string[] => {
  const upperNetwork = network.name.toUpperCase();
  const expectedEnvvars: { [key: string]: string[] } = {
    mainnet: [
      `${upperNetwork}_ADDRESS_PRIVATE_KEY`,
      `${upperNetwork}_RPC_URL`,
      `${upperNetwork}_GAS_IN_GWEI`,
    ],
    sepolia: [`${upperNetwork}_ADDRESS_PRIVATE_KEY`, `${upperNetwork}_RPC_URL`],
    zkSyncTestnet: [`${upperNetwork}_ADDRESS_PRIVATE_KEY`, `${upperNetwork}_RPC_URL`],
    localhost: [],
  };
  return expectedEnvvars[key];
}

/**
 * Check if the required environment variables exist
 */
export function ensureExpectedEnvvars() {
  let hasAllExpectedEnvVars = true;
  for (const envvarName of getExpectedEnvVars(network.name)) {
    if (!process.env[envvarName]) {
      console.error(`Missing environment variable ${envvarName}`);
      hasAllExpectedEnvVars = false;
    }
  }

  if (!hasAllExpectedEnvVars) {
    throw new Error(`Expected envvars missing`);
  }
}

export const packLayerZeroTrustedRemote = (
  remoteContractAddress: string, 
  localContractAddress: string
) => {
  return ethers.utils.solidityPack(
    ['address', 'address'],
    [remoteContractAddress, localContractAddress]
  );
}