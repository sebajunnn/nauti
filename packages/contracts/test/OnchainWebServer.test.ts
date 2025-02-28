import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { OnchainWebServer_v8, OnchainWebServerMetadata_v2 } from "../typechain-types";

describe("OnchainWebServer_v8", function () {
    let nftContract: OnchainWebServer_v8;
    let metadataContract: OnchainWebServerMetadata_v2;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    const mintPrice = ethers.parseEther("0.01");

    beforeEach(async function () {
        // Get signers
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy metadata contract
        const MetadataFactory = await ethers.getContractFactory("OnchainWebServerMetadata_v2");
        metadataContract = await MetadataFactory.deploy();
        await metadataContract.initialize();

        // Deploy main contract
        const NFTFactory = await ethers.getContractFactory("OnchainWebServer_v8");
        nftContract = await NFTFactory.deploy(await metadataContract.getAddress());
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await nftContract.owner()).to.equal(owner.address);
        });

        it("Should set the correct metadata contract", async function () {
            expect(await nftContract.metadataContract()).to.equal(await metadataContract.getAddress());
        });

        it("Should set the correct mint price", async function () {
            expect(await nftContract.mintPrice()).to.equal(mintPrice);
        });
    });

    describe("Minting", function () {
        const testContent = "<h1>Test Content</h1>";
        const testName = "Test NFT";
        const testDescription = "Test Description";
        const testImageUrl = "https://test.com/image.jpg";

        it("Should mint a new token with correct payment", async function () {
            await expect(nftContract.connect(user1).mintPage(
                testContent,
                testName,
                testDescription,
                testImageUrl,
                { value: mintPrice }
            )).to.not.be.reverted;

            expect(await nftContract.ownerOf(0)).to.equal(user1.address);
        });

        it("Should fail to mint with insufficient payment", async function () {
            await expect(nftContract.connect(user1).mintPage(
                testContent,
                testName,
                testDescription,
                testImageUrl,
                { value: ethers.parseEther("0.005") }
            )).to.be.revertedWith("Insufficient payment");
        });

        it("Should increment token IDs correctly", async function () {
            await nftContract.connect(user1).mintPage(
                testContent, testName, testDescription, testImageUrl, { value: mintPrice }
            );
            await nftContract.connect(user2).mintPage(
                testContent, testName, testDescription, testImageUrl, { value: mintPrice }
            );

            expect(await nftContract.totalSupply()).to.equal(2);
        });
    });

    describe("Withdrawal", function () {
        const testContent = "<h1>Test Content</h1>";
        const testName = "Test NFT";
        const testDescription = "Test Description";
        const testImageUrl = "https://test.com/image.jpg";

        beforeEach(async function () {
            // Mint a few NFTs to accumulate ETH in the contract
            await nftContract.connect(user1).mintPage(
                testContent, testName, testDescription, testImageUrl, { value: mintPrice }
            );
            await nftContract.connect(user2).mintPage(
                testContent, testName, testDescription, testImageUrl, { value: mintPrice }
            );
        });

        it("Should allow owner to withdraw", async function () {
            const initialBalance = await ethers.provider.getBalance(owner.address);
            const contractBalance = await ethers.provider.getBalance(await nftContract.getAddress());

            const tx = await nftContract.withdraw();
            const receipt = await tx.wait();
            const gasCost = receipt!.gasUsed * receipt!.gasPrice;

            const finalBalance = await ethers.provider.getBalance(owner.address);
            expect(finalBalance - initialBalance + gasCost).to.equal(contractBalance);
        });

        it("Should not allow non-owner to withdraw", async function () {
            await expect(nftContract.connect(user1).withdraw())
                .to.be.revertedWithCustomError(nftContract, "OwnableUnauthorizedAccount");
        });

        it("Should fail if there's nothing to withdraw", async function () {
            // First withdraw everything
            await nftContract.withdraw();
            // Then try to withdraw again
            await expect(nftContract.withdraw())
                .to.be.revertedWith("No ETH to withdraw");
        });

        it("Should return correct balance", async function () {
            const balance = await nftContract.getBalance();
            expect(balance).to.equal(mintPrice * 2n);
        });
    });
}); 