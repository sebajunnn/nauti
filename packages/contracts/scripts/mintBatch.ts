import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    // Get the contract instances
    const [deployer] = await ethers.getSigners();
    const nftContract = await ethers.getContract("OnchainWebServer_v8");

    // Directory paths
    const htmlsDir = path.join(__dirname, "../resources/htmls");
    const ipfsHashesPath = path.join(__dirname, "../resources/ipfsHashes.json");

    // Read IPFS hashes
    const ipfsHashes = JSON.parse(fs.readFileSync(ipfsHashesPath, 'utf8'));

    // Read all HTML files
    const htmlFiles = fs.readdirSync(htmlsDir)
        .filter(file => file.endsWith('.html'))
        .sort((a, b) => {
            const indexA = parseInt(a.split('.')[0]);
            const indexB = parseInt(b.split('.')[0]);
            return indexA - indexB;
        });

    console.log(`Found ${htmlFiles.length} HTML files to mint`);

    // Mint each NFT
    for (let i = 0; i < 36; i++) {
        const htmlContent = fs.readFileSync(path.join(htmlsDir, htmlFiles[i % 11]), 'utf8');

        // Get corresponding IPFS URL
        const ipfsData = ipfsHashes.find((item: any) => item.index === i + 13);
        if (!ipfsData) {
            console.error(`No IPFS data found for index ${i}, skipping...`);
            continue;
        }

        const name = `Issue No.${i}`;
        const description = `Web3 Pages Issue Number ${i}`;

        console.log(`Minting NFT ${i}...`);
        console.log(`Using image URL: ${ipfsData.ipfsUrl}`);

        try {
            const tx = await nftContract.mintPage(
                htmlContent,
                name,
                description,
                ipfsData.ipfsUrl,
                {
                    value: ethers.parseEther("0.01"),
                }
            );

            await tx.wait();
            console.log(`Successfully minted NFT ${i} (tx: ${tx.hash})`);
        } catch (error) {
            console.error(`Failed to mint NFT ${i}:`, error);
        }
    }

    console.log("Batch minting complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 