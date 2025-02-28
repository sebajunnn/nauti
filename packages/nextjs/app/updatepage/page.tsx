import { Header } from "@/components/Header";
import PageUpdate from "@/components/PageUpdate";

export default function UpdatePage() {
    return (
        <div className={`flex flex-col min-h-screen `}>
            {/* <Header /> */}
            <main className="relative flex flex-col flex-1">
                <div className="flex flex-col gap-8 w-full mx-auto">
                    <div className="grid grid-cols-1 gap-8">
                        <div className="bg-base-100 rounded-lg shadow">
                            <PageUpdate />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
