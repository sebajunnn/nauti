import GoldenSpiral from "@/components/GoldenSpiral/GoldenSpiral";

export default function Home() {
    return (
        <main className="h-screen w-full overflow-hidden bg-primary-foreground">
            {/* <h1 className="text-2xl font-bold mb-4 text-center">Infinite Golden Spiral</h1> */}
            <GoldenSpiral className="w-full h-full p-4" />
        </main>
    );
}
