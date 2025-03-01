import Image from "next/image";
import { Loader2 } from "lucide-react";
import { getRandomColor } from "@/utils";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";
import { useSquareStore } from "@/stores/useSquareStore";
interface ContentCardProps {
    image: string | null;
    name: string;
    content: string;
    loading?: boolean;
    onClick: () => void;
    index: number;
    scaledSize: number;
}

const FIXED_IMAGE_SIZE = 400;
const FIXED_QUALITY = 100;
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 2048 2048' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export function ContentCard({
    image,
    name,
    content,
    loading = false,
    onClick,
    index,
    scaledSize,
}: ContentCardProps) {
    const [randomColor] = useState(getRandomColor());
    const { totalSupply } = useSquareStore();

    if (loading) {
        return (
            <div className="relative w-full h-full p-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-chart-2" />
            </div>
        );
    }

    if (!image) {
        return (
            <div className="relative w-full h-full m-1 flex items-center justify-center bg-background/10">
                <span
                    className="text-chart-5 text-center font-medium font-rubik"
                    style={{ fontSize: `${scaledSize * 0.03}px` }}
                >
                    No content available
                </span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full p-1 group">
            <div className="w-full h-full">
                <Image
                    src={image || "/placeholder.jpg"}
                    alt={content}
                    width={FIXED_IMAGE_SIZE}
                    height={FIXED_IMAGE_SIZE}
                    className="w-full h-full object-cover"
                    quality={FIXED_QUALITY}
                    draggable={false}
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
                <div className="absolute inset-5 flex items-center justify-center">
                    <button
                        className={cn(
                            "w-full h-full rounded-full mix-blend-multiply",
                            "transform scale-0 group-hover:scale-100",
                            "transition-transform duration-300 ease-out",
                            "flex items-center justify-center"
                        )}
                        style={{
                            backgroundColor: randomColor,
                            opacity: 1,
                        }}
                        onClick={onClick}
                    ></button>
                </div>
            </div>
            <div
                className="absolute inset-1 pointer-events-none opacity-[0.5] mix-blend-overlay"
                style={{
                    backgroundImage: NOISE_SVG,
                    filter: "contrast(320%) brightness(100%)",
                }}
            />
            <div
                className={`absolute bottom-0 left-0 p-2
                items-center leading-none flex flex-row gap-1
                `}
            >
                <Circle className="text-primary fill-primary" size={scaledSize * 0.03} />
                <h3
                    className={cn("text-primary font-bold")}
                    style={{ fontSize: `${scaledSize * 0.025}px` }}
                >
                    i: {index > totalSupply ? "0" : index}
                </h3>
            </div>
            <div className="absolute top-0 right-0 p-3 items-baseline leading-none w-[80%]">
                <h3
                    className="text-primary text-right font-bold"
                    style={{ fontSize: `${scaledSize * 0.025}px` }}
                >
                    story: {name || "undefined"}
                </h3>
            </div>
        </div>
    );
}
