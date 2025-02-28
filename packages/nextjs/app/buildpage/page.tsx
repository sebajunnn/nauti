"use client";

import PageCreate from "@/components/PageCreate";

export default function BuildPage() {
    return (
        <main className={`flex flex-col min-h-screen bg-primary-foreground overflow-hidden`}>
            <PageCreate />
        </main>
    );
}
