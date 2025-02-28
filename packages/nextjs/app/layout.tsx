import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";
import "@rainbow-me/rainbowkit/styles.css";
import { Navbar } from "@/components/nav/Navbar";

const rubik = localFont({
    src: [
        {
            path: "./fonts/rubik/Rubik[wght].ttf",
            style: "normal",
        },
        {
            path: "./fonts/rubik/Rubik-Italic[wght].ttf",
            style: "italic",
        },
    ],
    variable: "--font-rubik",
    display: "swap",
});

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

const sprat = localFont({
    src: "./fonts/sprat/Sprat_Variable.ttf",
    variable: "--font-sprat",
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
        <html
            lang="en"
            suppressHydrationWarning
            className={`${redaction.variable} ${sprat.variable} ${rubik.variable} antialiased font-rubik`}
        >
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    // enableSystem
                    disableTransitionOnChange
                >
                    <Providers>
                        <Navbar />
                        {children}
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
