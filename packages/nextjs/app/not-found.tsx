import Image from "next/image";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function NotFound() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <Providers>
                <div className="min-h-screen flex items-center justify-center bg-foreground">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-4">
                            <h1 className="text-[15rem] font-redaction font-[250] text-chart-5">
                                4
                            </h1>
                            <Image
                                src="/nauti-logo-w.svg"
                                alt="404"
                                width={150}
                                height={150}
                                draggable={false}
                            />
                            <h1 className="text-[15rem] font-redaction font-[250] text-chart-5">
                                4
                            </h1>
                        </div>

                        <h2 className="text-[3rem] font-redaction font-[350] text-background">
                            You're Being Nauti
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto">Page Not Found</p>
                    </div>
                </div>
            </Providers>
        </ThemeProvider>
    );
}
