import { ethers } from "hardhat";
import { OnchainWebServer_v8 } from "../typechain-types";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Withdrawing with account:", deployer.address);

    const nftContract = await ethers.getContract<OnchainWebServer_v8>(
        "OnchainWebServer_v8",
        deployer
    );

    // Get current balance
    const balance = await ethers.provider.getBalance(await nftContract.getAddress());
    console.log("Contract balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.log("No ETH to withdraw");
        return;
    }

    try {
        const tx = await nftContract.withdraw();
        await tx.wait();
        console.log("Successfully withdrew", ethers.formatEther(balance), "ETH");
    } catch (error) {
        console.error("Failed to withdraw:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
