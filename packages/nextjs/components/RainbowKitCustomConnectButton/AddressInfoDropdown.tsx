import { BlockieAvatar } from "@/components/BlockieAvatar";
import { Address } from "viem";

type AddressInfoDropdownProps = {
  address: Address;
  displayName?: string;
  ensAvatar?: string;
  blockExplorerAddressLink?: string;
};

export const AddressInfoDropdown = ({ address, displayName, ensAvatar }: AddressInfoDropdownProps) => {
  return (
    <div className="flex items-center gap-2">
      <BlockieAvatar address={address} size={24} ensImage={ensAvatar} />
      <span className="font-medium">
        {displayName || address.slice(0, 6) + "..." + address.slice(-4)}
      </span>
    </div>
  );
};
