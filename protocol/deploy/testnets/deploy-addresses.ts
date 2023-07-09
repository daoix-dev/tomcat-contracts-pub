export interface SupportedChains {
    sepolia: 'sepolia';
    zkSyncTestnet: 'zkSyncTestnet';
}

interface DeployConstants {
    LAYER_ZERO: {
        CHAINIDS: {[key in keyof SupportedChains]: number},
        ENDPOINTS: {[key in keyof SupportedChains]: string},
    },
}

export const DEPLOY_CONSTANTS: DeployConstants = {
    LAYER_ZERO: {
        // https://layerzero.gitbook.io/docs/technical-reference/testnet/testnet-addresses
        CHAINIDS: {
            sepolia: 10161,
            zkSyncTestnet: 10165,
        },
        ENDPOINTS: {
            sepolia: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
            zkSyncTestnet: "0x093D2CF57f764f09C3c2Ac58a42A2601B8C79281",
        }
    },
};

export interface DeployedContracts {
    tomcat: {
        TC_MAV_TOKEN: string;
        TOMCAT_LAUNCH_VAULT: string;
    },
    maverick: {
        MAV_TOKEN: string;
    }
}

export const DEPLOYED_CONTRACTS: {[key in keyof SupportedChains]: DeployedContracts} = {
    sepolia: {
        tomcat: {
            TC_MAV_TOKEN: "0x24c317fE56F7e1671EA53fB9d79e2c804F366AD8",
            TOMCAT_LAUNCH_VAULT: "0xf394229d38b74585f28Dd999B5b953654A238C4D",
        },
        maverick: {
            MAV_TOKEN: "0x9778a5Fe095BDD45E4E266B118e7B527cEC37878",
        }
    },
    zkSyncTestnet: {
        tomcat: {
            TC_MAV_TOKEN: "0xb50E361bd120574a14054f13d8072A97A6c7E73d",
            TOMCAT_LAUNCH_VAULT: "0x625d3E8d4487475F634a1178834339F419C549D0",
        },
        maverick: {
            MAV_TOKEN: "0xDc358BcAe6BF999d125c2809953D4240e0A21dD4",
        }
    },
};
