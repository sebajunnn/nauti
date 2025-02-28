import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Withdrawing with account:", deployer.address);

    const nftContract = await ethers.getContract("OnchainWebServer_v8");

    // Get current balance
    const balance = await nftContract.getBalance();
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