import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";
import { NoiseOverlay } from "@/components/NoiseOverlay";

// <div className="font-redaction font-[100]">Redaction 100</div>
// <div className="font-redaction font-[200]">Redaction 70</div>
// <div className="font-redaction font-[300]">Redaction 50</div>
// <div className="font-redaction font-[350]">Redaction 35</div>
// <div className="font-redaction font-[400]">Redaction 20</div>
// <div className="font-redaction font-[500]">Redaction 10</div>
const redaction = localFont({
    variable: "--font-redaction",
    display: "swap",
    src: [
        {
            path: "./fonts/redaction/Redaction-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/redaction/Redaction-Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "./fonts/redaction/Redaction-Italic.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/redaction/Redaction_100-Regular.woff2",
            weight: "100",
            style: "normal",
        },
        {
            path: "./fonts/redaction/Redaction_100-Bold.woff2",
            weight: "100",
            style: "bold",
        },
        {
            path: "./fonts/redaction/Redaction_100-Italic.woff2",
            weight: "100",
            style: "italic",
        },
        {
            path: "./fonts/redaction/Redaction_70-Regular.woff2",
            weight: "200",
            style: "normal",
        },
        {
            path: "./fonts/redaction/Redaction_70-Bold.woff2",
            weight: "200",
            style: "bold",
        },
        {
            path: "./fonts/redaction/Redaction_70-Italic.woff2",
            weight: "200",
            style: "italic",
        },
        {
            path: "./fonts/redaction/Redaction_50-Regular.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "./fonts/redaction/Redaction_50-Bold.woff2",
            weight: "300",
            style: "bold",
        },
        {
            path: "./fonts/redaction/Redaction_50-Italic.woff2",
            weight: "300",
            style: "italic",
        },
        {
            path: "./fonts/redaction/Redaction_35-Regular.woff2",
            weight: "350",
            style: "normal",
        },
        {
            path: "./fonts/redaction/Redaction_35-Bold.woff2",
            weight: "350",
            style: "bold",
        },
        {
            path: "./fonts/redaction/Redaction_35-Italic.woff2",
            weight: "350",
            style: "italic",
        },
        {
            path: "./fonts/redaction/Redaction_20-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/redaction/Redaction_20-Bold.woff2",
            weight: "400",
            style: "bold",
        },
        {
            path: "./fonts/redaction/Redaction_20-Italic.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/redaction/Redaction_10-Regular.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/redaction/Redaction_10-Bold.woff2",
            weight: "500",
            style: "bold",
        },
        {
            path: "./fonts/redaction/Redaction_10-Italic.woff2",
            weight: "500",
            style: "italic",
        },
    ],
});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Nauti",
    description: "Eternal Web3 Pages",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${redaction.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-redaction`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    // enableSystem
                    disableTransitionOnChange
                >
                    <Providers>{children}</Providers>
                </ThemeProvider>
                {/* <NoiseOverlay /> */}
            </body>
        </html>
    );
}
