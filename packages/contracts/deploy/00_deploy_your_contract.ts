import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployOnchainWebServer: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const metadataContract = await deploy("OnchainWebServerMetadata_v2", {
    from: deployer,
    log: true,
  });

  await deploy("OnchainWebServer_v8", {
    from: deployer,
    log: true,
    args: [metadataContract.address],
  });
};

export default deployOnchainWebServer;
deployOnchainWebServer.tags = ["OnchainWebServer_v8"];
