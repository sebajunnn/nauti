"use client";

import PageCreate from "@/components/PageCreate";
import { Header } from "@/components/Header";
export default function BuildPage() {
    return (
        <main className={`flex flex-col min-h-screen bg-primary-foreground overflow-hidden`}>
            <Header />
            <PageCreate />
        </main>
    );
}
