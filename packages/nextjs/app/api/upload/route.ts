import { NextResponse } from "next/server";
import { pinataClient } from "@/services/pinata";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const result = await pinataClient.uploadToIPFS(file);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
} 