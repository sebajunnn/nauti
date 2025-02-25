import { cn } from "@/lib/utils";

interface HeroCardProps {
    fontSize: number;
}

export function HeroCard({ fontSize }: HeroCardProps) {
    return (
        <div className={cn("flex items-center justify-center w-full h-full px-12 pr-12 py-0", "")}>
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
    );
}
