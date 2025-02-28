import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    // Run the mint batch script
    await hre.run("run", { script: "scripts/mintBatch.ts" });
};

func.tags = ["mint-batch"];
export default func; 