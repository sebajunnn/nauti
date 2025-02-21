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
                    size="sm"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <Balance
                      address={account.address as AddressType}
                      className="font-medium"
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: networkColor }}
                    >
                      {chain.name}
                    </span>
                  </div>
                  <Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <AddressInfoDropdown
                            address={account.address as AddressType}
                            displayName={account.displayName}
                            ensAvatar={account.ensAvatar}
                            blockExplorerAddressLink={blockExplorerAddressLink}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60">
                        <CopyAddressButton address={account.address as AddressType} />
                        <DialogTrigger asChild>
                          <DropdownMenuItem>
                            <QrCode className="h-4 w-4 mr-2" />
                            View QR Code
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuSeparator />
                        <ViewExplorerButton link={blockExplorerAddressLink} />
                        {allowedNetworks.length > 1 && <NetworkOptions />}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
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
                          <QRCodeSVG value={account.address as AddressType} size={256} />
                        </div>
                        <Address address={account.address as AddressType} format="short" disableAddressLink onlyEnsOrAddress />
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
