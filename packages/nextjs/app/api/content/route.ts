import { NextResponse } from "next/server";

// Simulate database delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const index = searchParams.get("index");

    return NextResponse.json({
        index: index,
        content: `Content for index ${index}`,
        image: `https://picsum.photos/seed/${index}/1000`,
    });
}
