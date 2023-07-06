export interface DeployedContracts {
    tomcat: {
        TC_MAV_TOKEN: string;
        TOMCAT_LAUNCH_VAULT: string;
    },
    maverick: {
        MAV_TOKEN: string;
    }
}

export const DEPLOYED_CONTRACTS: DeployedContracts = {
    tomcat: {
        TC_MAV_TOKEN: "0xc112C191A1aa51781C8D540f87B05ee3bbF18336",
        TOMCAT_LAUNCH_VAULT: "0x29C623aD784E71dB7a8c37109C7155fe4B429C21",
    },
    maverick: {
        MAV_TOKEN: "0x328980662C51Dac2aCC36cAf8D097Fb0221F1e07",
    }
};
