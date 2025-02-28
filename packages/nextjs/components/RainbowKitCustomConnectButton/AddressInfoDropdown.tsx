import { BlockieAvatar } from "@/components/BlockieAvatar";
import { Address } from "viem";

type AddressInfoDropdownProps = {
    address: Address;
    displayName?: string;
    ensAvatar?: string;
    blockExplorerAddressLink?: string;
};

export const AddressInfoDropdown = ({
    address,
    displayName,
    ensAvatar,
}: AddressInfoDropdownProps) => {
    return (
        <div
            className={`flex items-center gap-2 pl-3 border bg-foreground
                    border-foreground rounded-full hover:bg-chart-2
                    hover:border-chart-2 !hover:text-black
                    transition-all duration-100 text-primary`}
        >
            <span className="font-medium">
                {displayName || address.slice(0, 6) + "..." + address.slice(-4)}
            </span>
            <BlockieAvatar address={address} size={18} ensImage={ensAvatar} />
        </div>
    );
};
