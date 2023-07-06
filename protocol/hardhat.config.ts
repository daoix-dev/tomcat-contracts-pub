require('dotenv').config();

import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import fs from "fs";

function getRemappings() {
    return fs
      .readFileSync("remappings.txt", "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => line.trim().split("="));
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    paths: {
        sources: "./contracts",
        artifacts: "./artifacts-hardhat",
        cache: "./cache-hardhat", // Use a different cache for Hardhat than Foundry
    },
    // This fully resolves paths for imports in the ./lib directory for Hardhat
    // https://book.getfoundry.sh/config/hardhat#instructions
    preprocess: {
        eachLine: (_: unknown) => ({
            transform: (line: string) => {
                if (line.match(/^\s*import /i)) {
                    getRemappings().forEach(([find, replace]) => {
                        if (line.match(find)) {
                            line = line.replace(find, replace);
                        }
                    });
                }
                return line;
            },
        }),
    },
    solidity: {
        compilers: [
        {
            version: '0.8.18',
            settings: {
            optimizer: {
                enabled: true,
                runs: 999999,
            },
            },
        },
        ],
    },
    typechain: {
        target: 'ethers-v5',
        outDir: './typechain',
    },
    networks: {
        localhost: {
            timeout: 100_000
          },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || '',
            accounts: process.env.SEPOLIA_ADDRESS_PRIVATE_KEY
                ? [process.env.SEPOLIA_ADDRESS_PRIVATE_KEY]
                : [],
            gasPrice: 2000000000,
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || '',
            accounts: process.env.MAINNET_ADDRESS_PRIVATE_KEY
                ? [process.env.MAINNET_ADDRESS_PRIVATE_KEY]
                : [],
            gasPrice: parseInt(process.env.MAINNET_GAS_IN_GWEI || '0') * 1000000000,
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY,
            sepolia: process.env.ETHERSCAN_API_KEY,
        },
    },
    mocha: {
        timeout: 120000,
    },
    contractSizer: {
        alphaSort: true,
    }
};