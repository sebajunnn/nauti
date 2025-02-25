import Image from "next/image";
import { Loader2 } from "lucide-react";

interface ContentCardProps {
    image: string | null;
    content: string;
    loading?: boolean;
    onClick: () => void;
}

const FIXED_IMAGE_SIZE = 400;
const FIXED_QUALITY = 100;
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 2048 2048' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export function ContentCard({ image, content, loading = false, onClick }: ContentCardProps) {
    if (loading) {
        return (
            <div className="relative w-full h-full p-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!image) {
        return (
            <div className="relative w-full h-full p-1 flex items-center justify-center">
                <span className="text-primary">No content available</span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full p-1 pointer-events-none">
            <div className="w-full h-full cursor-pointer pointer-events-auto" onClick={onClick}>
                <Image
                    src={image}
                    alt={content}
                    width={FIXED_IMAGE_SIZE}
                    height={FIXED_IMAGE_SIZE}
                    className="w-full h-full object-cover"
                    quality={FIXED_QUALITY}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${btoa(
                        '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#666"/></svg>'
                    )}`}
                    style={{
                        transformOrigin: "center",
                        backfaceVisibility: "hidden",
                    }}
                />
            </div>
            <div
                className="absolute inset-1 pointer-events-none opacity-[0.5] mix-blend-overlay"
                style={{
                    backgroundImage: NOISE_SVG,
                    filter: "contrast(320%) brightness(100%)",
                }}
            />
        </div>
    );
}
