import Link from "next/link";
import { hardhat } from "viem/chains";
import { useTargetNetwork } from "@/hooks/useTargetNetwork";
import { cn } from "@/lib/utils";

type AddressLinkWrapperProps = {
  children: React.ReactNode;
  disableAddressLink?: boolean;
  blockExplorerAddressLink: string;
  className?: string;
};

export const AddressLinkWrapper = ({
  children,
  disableAddressLink,
  blockExplorerAddressLink,
  className,
}: AddressLinkWrapperProps) => {
  const { targetNetwork } = useTargetNetwork();

  if (disableAddressLink) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={blockExplorerAddressLink}
      target={targetNetwork.id === hardhat.id ? undefined : "_blank"}
      rel={targetNetwork.id === hardhat.id ? undefined : "noopener noreferrer"}
      className={cn(
        "transition-colors hover:text-primary",
        className
      )}
    >
      {children}
    </Link>
  );
};
