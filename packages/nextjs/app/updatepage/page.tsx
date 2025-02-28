import { Header } from "@/components/Header";
import PageUpdate from "@/components/PageUpdate";

export default function UpdatePage() {
    return (
        <main className={`flex flex-col min-h-screen bg-primary-foreground overflow-hidden`}>
            <PageUpdate />
        </main>
    );
}
