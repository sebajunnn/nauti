import { Header } from "@/components/Header";
import PageView from "@/components/PageView";

export default function ViewPage() {
    return (
        <div className={`flex flex-col min-h-screen `}>
            {/* <Header /> */}
            <main className="relative flex flex-col flex-1">
                <div className="flex flex-col gap-8 w-full mx-auto">
                    <div className="grid grid-cols-1 gap-8">
                        <div className="bg-base-100 rounded-lg shadow">
                            <PageView />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
