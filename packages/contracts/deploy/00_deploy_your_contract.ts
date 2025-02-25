import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployOnchainWebServer: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("OnchainWebServer_v6", {
    from: deployer,
    log: true,
  });
};

export default deployOnchainWebServer;
deployOnchainWebServer.tags = ["OnchainWebServer_v6"];
