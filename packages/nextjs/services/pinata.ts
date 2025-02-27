import PinataClient from "@pinata/sdk";
import { Readable } from "stream";

const pinata = new PinataClient(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

export const uploadToIPFS = async (file: File) => {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a readable stream from the buffer
    const stream = Readable.from(buffer);

    const result = await pinata.pinFileToIPFS(stream, {
        pinataMetadata: {
            name: file.name,
        },
    });

    return result;
}

export const pinataClient = {
    uploadToIPFS,
}