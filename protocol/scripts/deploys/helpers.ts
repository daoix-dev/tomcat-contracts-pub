import { BaseContract, BigNumber, ContractFactory, ContractTransaction } from "ethers";
import { network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

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

    const argsPath = `scripts/deploys/${network.name}/deploymentArgs/${contract.address}.js`;
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

/**
 * Check if process.env.MAINNET_ADDRESS_PRIVATE_KEY (required when doing deploy)
 */
export function expectAddressWithPrivateKey() {
    if (network.name == 'mainnet' && !process.env.MAINNET_ADDRESS_PRIVATE_KEY)
      throw new Error("Missing environment variable MAINNET_ADDRESS_PRIVATE_KEY. A mainnet address private key with eth is required to deploy/manage contracts");
    if (network.name == 'sepolia' && !process.env.SEPOLIA_ADDRESS_PRIVATE_KEY)
        throw new Error("Missing environment variable SEPOLIA_ADDRESS_PRIVATE_KEY. A mumbai address private key with eth is required to deploy/manage contracts");
  }
  
  const expectedEnvvars: { [key: string]: string[] } = {
    mainnet: [
      'MAINNET_ADDRESS_PRIVATE_KEY',
      'MAINNET_RPC_URL',
      'MAINNET_GAS_IN_GWEI',
    ],
    sepolia: ['SEPOLIA_ADDRESS_PRIVATE_KEY', 'SEPOLIA_RPC_URL'],
    localhost: [],
  };
  
  /**
   * Check if the required environment variables exist
   */
  export function ensureExpectedEnvvars() {
    let hasAllExpectedEnvVars = true;
    for (const envvarName of expectedEnvvars[network.name]) {
      if (!process.env[envvarName]) {
        console.error(`Missing environment variable ${envvarName}`);
        hasAllExpectedEnvVars = false;
      }
    }
  
    if (!hasAllExpectedEnvVars) {
      throw new Error(`Expected envvars missing`);
    }
  }