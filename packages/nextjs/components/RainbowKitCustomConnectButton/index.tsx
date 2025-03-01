"use client";

// @refresh reset
import { Balance } from "@/components/Balance";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNetworkColor } from "@/hooks";
import { useTargetNetwork } from "@/hooks/useTargetNetwork";
import { getBlockExplorerAddressLink, getTargetNetworks } from "@/utils/scaffold-eth";
import { CopyAddressButton } from "./CopyAddressButton";
import { ViewExplorerButton } from "./ViewExplorerButton";
import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { LogOut, QrCode } from "lucide-react";
import { DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Dialog, DialogContent } from "../ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { Address } from "@/components/Address/Address";

const allowedNetworks = getTargetNetworks();
/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
    const networkColor = useNetworkColor();
    const { targetNetwork } = useTargetNetwork();
    const { disconnect } = useDisconnect();

    return (
        <ConnectButton.Custom>
            {({ account, chain, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                const blockExplorerAddressLink = account
                    ? getBlockExplorerAddressLink(targetNetwork, account.address)
                    : undefined;

                return (
                    <>
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        onClick={openConnectModal}
                                        className="bg-primary text-primary-foreground px-2 py-0 h-5 rounded-full hover:bg-chart-3 hover:text-background"
                                    >
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported || chain.id !== targetNetwork.id) {
                                return <WrongNetworkDropdown />;
                            }

                            return (
                                <div className="inline-flex items-center h-5 overflow-visible">
                                    <div className="flex flex-col items-end p-0 relative z-0">
                                        <Balance
                                            address={account.address as AddressType}
                                            className="font-medium text-right p-0"
                                        />
                                        {/* <span
                                            className="text-xs font-medium w-full text-right truncate"
                                            style={{ color: networkColor }}
                                        >
                                            {chain.name}
                                        </span> */}
                                    </div>
                                    <Dialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    className={`
                                                        flex items-center h-5 rounded-full
                                                        relative z-10 -ml-3 p-0
                                                        hover:text-white border-0
                                                        focus:outline-none focus:ring-0 focus:border-0
                                                        focus-within:ring-0 focus-within:outline-none
                                                        focus-visible:ring-0 focus-visible:outline-none
                                                        focus-visible:border-0 focus-within:border-0 
                                                    `}
                                                >
                                                    <AddressInfoDropdown
                                                        address={account.address as AddressType}
                                                        displayName={account.displayName}
                                                        ensAvatar={account.ensAvatar}
                                                        blockExplorerAddressLink={
                                                            blockExplorerAddressLink
                                                        }
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                sideOffset={4}
                                                avoidCollisions={false}
                                                className="rounded-xl"
                                            >
                                                <CopyAddressButton
                                                    address={account.address as AddressType}
                                                />
                                                <DialogTrigger asChild>
                                                    <DropdownMenuItem className="rounded-lg hover:text-white focus:text-white">
                                                        <QrCode className="h-4 w-4 mr-2" />
                                                        View QR Code
                                                    </DropdownMenuItem>
                                                </DialogTrigger>
                                                <DropdownMenuSeparator />
                                                <ViewExplorerButton
                                                    link={blockExplorerAddressLink}
                                                />
                                                {allowedNetworks.length > 1 && <NetworkOptions />}
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-white rounded-lg focus:bg-destructive"
                                                    onClick={() => disconnect()}
                                                >
                                                    <LogOut className="h-4 w-4 mr-2" />
                                                    Disconnect
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Wallet Address QR Code</DialogTitle>
                                            </DialogHeader>
                                            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                                <div className="p-2 bg-white rounded-lg">
                                                    <QRCodeSVG
                                                        value={account.address as AddressType}
                                                        size={256}
                                                    />
                                                </div>
                                                <Address
                                                    address={account.address as AddressType}
                                                    format="short"
                                                    disableAddressLink
                                                    onlyEnsOrAddress
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            );
                        })()}
                    </>
                );
            }}
        </ConnectButton.Custom>
    );
};
