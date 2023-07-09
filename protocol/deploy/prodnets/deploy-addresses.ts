export interface SupportedChains {
    mainnet: 'mainnet';
    zkSyncMainnet: 'zkSyncMainnet';
    bnb: 'bnb';
}

interface DeployConstants {
    LAYER_ZERO: {
        CHAINIDS: {[key in keyof SupportedChains]: number},
        ENDPOINTS: {[key in keyof SupportedChains]: string},
    },
}

export const DEPLOY_CONSTANTS: DeployConstants = {
    LAYER_ZERO: {
        // https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids
        CHAINIDS: {
            mainnet: 101,
            zkSyncMainnet: 165,
            bnb: 102,
        },
        ENDPOINTS: {
            mainnet: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
            zkSyncMainnet: "0x9b896c0e23220469C7AE69cb4BbAE391eAa4C8da",
            bnb: "0x3c2269811836af69497E5F486A85D7316753cf62",
        }
    },
};

export interface DeployedContracts {
    tomcat: {
        MULTISIG: string;
        TC_MAV_TOKEN: string;
        TOMCAT_LAUNCH_VAULT: string;
    },
    maverick: {
        MAV_TOKEN: string;
    }
}

export const DEPLOYED_CONTRACTS: {[key in keyof SupportedChains]: DeployedContracts} = {
    mainnet: {
        tomcat: {
            MULTISIG: "0xF13Caf6dD7aF5829312B6401bcEFaf2C1775a3B6",
            TC_MAV_TOKEN: "0x0A1D3e7a21D4DAC9C58E80d51d9d34018b900E8B",
            TOMCAT_LAUNCH_VAULT: "0x1b25729D844586DF07bBa086D95a0e9f39780405",
        },
        maverick: {
            MAV_TOKEN: "0x7448c7456a97769f6cd04f1e83a4a23ccdc46abd",
        }
    },
    zkSyncMainnet: {
        tomcat: {
            MULTISIG: "",
            TC_MAV_TOKEN: "",
            TOMCAT_LAUNCH_VAULT: "",
        },
        maverick: {
            MAV_TOKEN: "0x787c09494Ec8Bcb24DcAf8659E7d5D69979eE508",
        }
    },
    bnb: {
        tomcat: {
            MULTISIG: "",
            TC_MAV_TOKEN: "",
            TOMCAT_LAUNCH_VAULT: "",
        },
        maverick: {
            MAV_TOKEN: "0xd691d9a68C887BDF34DA8c36f63487333ACfD103",
        }
    },
};
