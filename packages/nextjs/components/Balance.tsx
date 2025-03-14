"use client";

import { Address, formatEther } from "viem";
import { useDisplayUsdMode, useTargetNetwork, useWatchBalance } from "@/hooks";
import { useGlobalState } from "@/store/globalStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type BalanceProps = {
    address?: Address;
    className?: string;
    usdMode?: boolean;
};

/**
 * Display (ETH & USD) balance of an ETH address.
 */
export const Balance = ({ address, className = "", usdMode }: BalanceProps) => {
    const { targetNetwork } = useTargetNetwork();
    const nativeCurrencyPrice = useGlobalState((state) => state.nativeCurrency.price);
    const isNativeCurrencyPriceFetching = useGlobalState(
        (state) => state.nativeCurrency.isFetching
    );

    const {
        data: balance,
        isError,
        isLoading,
    } = useWatchBalance({
        address,
    });

    const { displayUsdMode, toggleDisplayUsdMode } = useDisplayUsdMode({ defaultUsdMode: usdMode });

    if (
        !address ||
        isLoading ||
        balance === null ||
        (isNativeCurrencyPriceFetching && nativeCurrencyPrice === 0)
    ) {
        return (
            <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-md border border-destructive/50 px-2 py-1">
                <span className="text-sm text-destructive">Error</span>
            </div>
        );
    }

    const formattedBalance = balance ? Number(formatEther(balance.value)) : 0;

    return (
        <Button
            onClick={toggleDisplayUsdMode}
            className={cn(
                "flex bg-white rounded-none rounded-l-full border-none outline-none shadow-none h-5 flex-col items-center",
                "gap-0.5 py-1 font-normal hover:bg-primary transition-colors duration-200",
                className
            )}
        >
            <div className="flex items-center justify-center gap-1 pr-5 pl-3">
                {displayUsdMode ? (
                    <>
                        <span className="text-sm">$</span>
                        <span className="text-sm font-bold bg-transparent">
                            {(formattedBalance * nativeCurrencyPrice).toFixed(2)}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-bold">{formattedBalance.toFixed(4)}</span>
                        <span className="text-sm bg-transparent">
                            {targetNetwork.nativeCurrency.symbol}
                        </span>
                    </>
                )}
            </div>
        </Button>
    );
};
