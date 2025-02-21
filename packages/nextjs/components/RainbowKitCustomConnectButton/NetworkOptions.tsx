import { useTheme } from "next-themes";
import { useAccount, useSwitchChain } from "wagmi";
import { ArrowLeftRight } from "lucide-react";
import { getNetworkColor } from "@/hooks";
import { getTargetNetworks } from "@/utils/scaffold-eth";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const allowedNetworks = getTargetNetworks();

export const NetworkOptions = () => {
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <>
      {allowedNetworks
        .filter(allowedNetwork => allowedNetwork.id !== chain?.id)
        .map(allowedNetwork => (
          <DropdownMenuItem
            key={allowedNetwork.id}
            onClick={() => switchChain?.({ chainId: allowedNetwork.id })}
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            <span>
              Switch to{" "}
              <span
                style={{
                  color: getNetworkColor(allowedNetwork, isDarkMode),
                }}
              >
                {allowedNetwork.name}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      <DropdownMenuSeparator />
    </>
  );
};
