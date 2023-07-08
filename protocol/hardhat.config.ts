require('dotenv').config();

import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';
import 'solidity-coverage';
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import fs from "fs";

const zkSyncNetworks = {
    // dynamically changes endpoints for local tests
    zkSyncTestnet: 
        process.env.NODE_ENV == "test"
        ? {
            url: "http://localhost:3050",
            ethNetwork: "http://localhost:8545",
            zksync: true,
        }
        : {
            url: process.env.ZKSYNCTESTNET_RPC_URL || "",
            ethNetwork: "goerli",
            zksync: true,
            verifyURL: "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
        },
    zkSyncMainnet: {
        url: process.env.ZKSYNCTESTNET_RPC_URL || "",
        ethNetwork: "ETH",
        zksync: true,
        verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification'
    },
}

function getRemappings() {
    return fs
      .readFileSync("remappings.txt", "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => line.trim().split("="));
}

const config = {
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
        hardhat: {
            zksync: false,
        },
        localhost: {
            timeout: 100_000,
            zksync: false,
          },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || '',
            accounts: process.env.SEPOLIA_ADDRESS_PRIVATE_KEY
                ? [process.env.SEPOLIA_ADDRESS_PRIVATE_KEY]
                : [],
            gasPrice: 2000000000,
            zksync: false,
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || '',
            accounts: process.env.MAINNET_ADDRESS_PRIVATE_KEY
                ? [process.env.MAINNET_ADDRESS_PRIVATE_KEY]
                : [],
            gasPrice: parseInt(process.env.MAINNET_GAS_IN_GWEI || '0') * 1000000000,
            zksync: false,
        },
        ...zkSyncNetworks,
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
    },
    zksolc: {
      version: "latest",
      settings: {},
    },
};

export default config;