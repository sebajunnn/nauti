import { NETWORKS_EXTRA_DATA } from "./networks";

import scaffoldConfig from "@/scaffold.config";
import { ChainWithAttributes } from "./networks";

// Treat any dot-separated string as a potential ENS name
const ensRegex = /.+\..+/;
export const isENS = (address = "") => ensRegex.test(address);

/**
 * @returns targetNetworks array containing networks configured in scaffold.config including extra network metadata
 */
export function getTargetNetworks(): ChainWithAttributes[] {
    return scaffoldConfig.targetNetworks.map(targetNetwork => ({
        ...targetNetwork,
        ...NETWORKS_EXTRA_DATA[targetNetwork.id],
    }));
}
