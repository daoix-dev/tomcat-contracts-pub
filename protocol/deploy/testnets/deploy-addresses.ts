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
            TC_MAV_TOKEN: "0xD3d8967E4204e3848988076f13919Cbc8753C3FB",
            TOMCAT_LAUNCH_VAULT: "0xeA7dcCd2a2539CaC967620cF77fBc142ed3D339D",
        },
        maverick: {
            MAV_TOKEN: "0x1898dcd1A7d552E86DdaafD14A4d3d12EE92b42b",
        }
    },
    zkSyncTestnet: {
        tomcat: {
            TC_MAV_TOKEN: "0xa4C477943601b423A0CBdBa870BDC4038F2ff9CD",
            TOMCAT_LAUNCH_VAULT: "0x444bdF8E018BD01aDf5928049e6aDeC3C7E4C8d6",
        },
        maverick: {
            MAV_TOKEN: "0x07E681540F3B1cCA7b77fcA91c6E638a872A4898",
        }
    },
};
