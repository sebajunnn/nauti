class PinataService {
    private baseUrl = "https://api.pinata.cloud/pinning";
    private headers;

    constructor() {
        this.headers = {
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!,
        };
    }

    async uploadToIPFS(file: File): Promise<{ IpfsHash: string }> {
        const formData = new FormData();
        formData.append("file", file);

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

export const pinataClient = new PinataService();