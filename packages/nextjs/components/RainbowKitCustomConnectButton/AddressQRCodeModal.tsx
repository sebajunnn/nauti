import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { Address } from "@/components/Address/Address";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { QrCode } from "lucide-react";

type AddressQRCodeModalProps = {
  address: AddressType;
  modalId: string;
};

export const AddressQRCodeModal = ({ address }: AddressQRCodeModalProps) => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div>
            <DropdownMenuItem>
              <QrCode className="h-4 w-4 mr-2" />
              View QR Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wallet Address QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="p-2 bg-white rounded-lg">
              <QRCodeSVG value={address} size={256} />
            </div>
            <Address address={address} format="long" disableAddressLink onlyEnsOrAddress />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
