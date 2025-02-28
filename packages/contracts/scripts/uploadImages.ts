import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

interface IpfsResult {
    index: number;
    filename: string;
    ipfsHash: string;
    ipfsUrl: string;
}

class PinataService {
    private baseUrl = "https://api.pinata.cloud/pinning";
    private headers;

    constructor() {
        this.headers = {
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!,
        };
    }

    async uploadFileToIPFS(filePath: string): Promise<{ IpfsHash: string }> {
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(filePath);
        const filename = path.basename(filePath);

        // Create a Blob from the file buffer
        const blob = new Blob([fileBuffer]);
        formData.append("file", blob, filename);

        const response = await fetch(`${this.baseUrl}/pinFileToIPFS`, {
            method: "POST",
            headers: {
                ...this.headers,
                // Don't set Content-Type header when using FormData
                // Browser will set it automatically with the boundary
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        return response.json();
    }
}

async function main() {
    const pinata = new PinataService();
    const imagesDir = path.join(__dirname, "../resources/images");
    const outputPath = path.join(__dirname, "../resources/ipfsHashes.json");

    // Read all image files
    const imageFiles = fs.readdirSync(imagesDir)
        .filter(file => /\.(jpg|jpeg|png|gif|webp|webm)$/i.test(file))
        .sort((a, b) => {
            // Sort by numeric index in filename
            const indexA = parseInt(a.split('.')[0]);
            const indexB = parseInt(b.split('.')[0]);
            return indexA - indexB;
        });

    console.log(`Found ${imageFiles.length} images to upload`);

    const results: IpfsResult[] = [];

    // Upload each image
    for (let i = 5; i < imageFiles.length; i++) {
        const filename = imageFiles[i];
        const filePath = path.join(imagesDir, filename);

        console.log(`Uploading ${filename} to IPFS...`);

        try {
            const result = await pinata.uploadFileToIPFS(filePath);
            const ipfsUrl = `https://ipfs.io/ipfs/${result.IpfsHash}`;

            results.push({
                index: i,
                filename,
                ipfsHash: result.IpfsHash,
                ipfsUrl
            });

            console.log(`Successfully uploaded ${filename}`);
            console.log(`IPFS Hash: ${result.IpfsHash}`);
            console.log(`IPFS URL: ${ipfsUrl}`);
            console.log('---');

            // Save progress after each successful upload
            fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

        } catch (error) {
            console.error(`Failed to upload ${filename}:`, error);
        }

        // Add a small delay between uploads to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\nUpload complete!");
    console.log(`Results saved to ${outputPath}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 