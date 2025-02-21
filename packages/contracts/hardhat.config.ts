import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import generateTsAbis from "./scripts/generateTsAbis";

// If not set, it uses the hardhat account 0 private key.
// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
const deployerPrivateKey =
  process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      gas: 800_000_000,
      blockGasLimit: 1_000_000_000,
    },
  },
};

// Extend the deploy task
task("deploy").setAction(async (args: any, hre: any, runSuper: any) => {
  // Run the original deploy task
  await runSuper(args);
  // Force run the generateTsAbis script
  await generateTsAbis(hre);
});

export default config;
