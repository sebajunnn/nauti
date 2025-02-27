import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroCardProps {
    fontSize: number;
    scale: number;
}

export function HeroCard({ fontSize, scale }: HeroCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const rotateX = useSpring(0, { stiffness: 100, damping: 30, mass: 2 });
    const rotateY = useSpring(0, { stiffness: 100, damping: 30, mass: 2 });
    const scaleMotion = useSpring(1, { stiffness: 100, damping: 30, mass: 2 });
    const tiltScaleThreshold = 2;
    const tiltAmplitude = 4; // degrees of rotation

    function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current || scale > tiltScaleThreshold) return;

        const rect = ref.current.getBoundingClientRect();
        const offsetX = event.clientX - rect.left - rect.width / 2;
        const offsetY = event.clientY - rect.top - rect.height / 2;

        const rotationX = (offsetY / (rect.height / 2)) * -tiltAmplitude;
        const rotationY = (offsetX / (rect.width / 2)) * tiltAmplitude;

        rotateX.set(rotationX);
        rotateY.set(rotationY);
    }

    function handleMouseEnter() {
        if (scale > tiltScaleThreshold) return;
        scaleMotion.set(1.02);
    }

    function handleMouseLeave() {
        if (scale > tiltScaleThreshold) return;
        scaleMotion.set(1);
        rotateX.set(0);
        rotateY.set(0);
    }

    return (
        <div
            ref={ref}
            className="w-full h-full [perspective:800px]"
            onMouseMove={handleMouse}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className={cn("w-full h-full", "[transform-style:preserve-3d]")}
                style={{
                    rotateX,
                    rotateY,
                    scale: scaleMotion,
                }}
            >
                <div
                    className={cn(
                        "flex items-center justify-center w-full h-full px-12 pr-12 py-2",
                        "select-none"
                    )}
                >
                    <div
                        className={cn(
                            "w-full h-full rounded-4xl bg-primary border-2 border-primary-foreground",
                            "flex items-center justify-between flex-col text-primary-foreground"
                        )}
                    >
                        <header className="flex flex-row items-center justify-between w-full px-4 py-2">
                            <h3 className="font-bold" style={{ fontSize: `${fontSize}px` }}>
                                • issue: 001
                            </h3>
                            <h3 className="font-bold" style={{ fontSize: `${fontSize}px` }}>
                                story: undefined
                            </h3>
                        </header>
                        <div className="flex-1 flex flex-row items-center justify-center overflow-hidden">
                            <h1 className="text-[100px] w-full font-redaction font-[350]">Nauti</h1>
                        </div>
                        <footer className="flex flex-row items-center justify-between w-full px-4 py-2">
                            <h4 className="text-base font-bold">by nature</h4>
                            <h4 className="text-base font-bold text-center absolute left-1/2 -translate-x-1/2">
                                Eternal Web3 Content
                            </h4>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
