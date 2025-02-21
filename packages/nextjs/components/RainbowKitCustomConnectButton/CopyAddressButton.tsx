import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Address } from "viem";

export const CopyAddressButton = ({ address }: { address: Address }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 800);
    };

    return (
        <DropdownMenuItem onClick={copyToClipboard}>
            {copied ? (
                <Check className="h-4 w-4 mr-2" />
            ) : (
                <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
    );
}; 