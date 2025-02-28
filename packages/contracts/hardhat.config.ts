import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, ".env.local") });
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import generateTsAbis from "./scripts/generateTsAbis";

// If not set, it uses the hardhat account 0 private key.
// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
const deployerPrivateKey =
  process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? (() => {
    console.warn("Warning: Using default deployer key - no __RUNTIME_DEPLOYER_PRIVATE_KEY found in .env");
    return "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  })();

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
  defaultNetwork: "conduit",
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
    conduit: {
      url: `https://rpc-mammothon-g2-testnet-4a2w8v0xqy.t.conduit.xyz/${process.env.CONDUIT_API_KEY}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://explorer-mammothon-g2-testnet-4a2w8v0xqy.t.conduit.xyz",
          apiKey: process.env.CONDUIT_API_KEY ?? (() => {
            console.warn("Warning: No CONDUIT_API_KEY found in .env");
            return "";
          })(),
        },
      },
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
