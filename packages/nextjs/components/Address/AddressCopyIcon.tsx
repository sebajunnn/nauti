import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AddressCopyIcon = ({ className, address }: { className?: string; address: string }) => {
  const [addressCopied, setAddressCopied] = useState(false);

  return (
    <CopyToClipboard
      text={address}
      onCopy={() => {
        setAddressCopied(true);
        setTimeout(() => {
          setAddressCopied(false);
        }, 800);
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-auto w-auto p-0 hover:bg-transparent", className)}
        onClick={e => e.stopPropagation()}
      >
        {addressCopied ? (
          <Check className={cn("text-green-500", className)} aria-hidden="true" />
        ) : (
          <Copy className={className} aria-hidden="true" />
        )}
      </Button>
    </CopyToClipboard>
  );
};
