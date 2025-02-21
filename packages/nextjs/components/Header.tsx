"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { FaucetButton } from "@/components/FaucetButton";
import { useTargetNetwork } from "@/hooks/useTargetNetwork";
import { RainbowKitCustomConnectButton } from "@/components/RainbowKitCustomConnectButton";

type HeaderMenuLink = {
    label: string;
    href: string;
    icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
    {
        label: "Home",
        href: "/",
    },
    {
        label: "Build",
        href: "/buildpage",
    },
    {
        label: "Update",
        href: "/updatepage",
    },
    {
        label: "View",
        href: "/viewpage",
    },
];

export const HeaderMenuLinks = () => {
    const pathname = usePathname();

    return (
        <>
            {menuLinks.map(({ label, href, icon }) => {
                const isActive = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                            isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {icon}
                        <span>{label}</span>
                    </Link>
                );
            })}
        </>
    );
};

/**
 * Site header
 */
export const Header = () => {
    const { targetNetwork } = useTargetNetwork();
    const isLocalNetwork = targetNetwork.id === hardhat.id;

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="flex items-center space-x-4 lg:space-x-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="relative h-8 w-8">
                            <Image alt="Logo" className="rounded-full" fill src="/logo.svg" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold">Blocks For Sale</span>
                            <span className="text-xs text-muted-foreground">Web3 Pages</span>
                        </div>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6">
                        <HeaderMenuLinks />
                    </nav>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items- center space-x-2">
                        <RainbowKitCustomConnectButton />
                        {isLocalNetwork && <FaucetButton />}
                    </nav>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="md:hidden" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[80vw] sm:w-[340px]">
                            <nav className="flex flex-col space-y-4">
                                <HeaderMenuLinks />
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};
