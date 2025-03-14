"use client";

import { AddressCopyIcon } from "./AddressCopyIcon";
import { AddressLinkWrapper } from "./AddressLinkWrapper";
import { Address as AddressType, getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { BlockieAvatar } from "@/components/BlockieAvatar";
import { useTargetNetwork } from "@/hooks/useTargetNetwork";
import { getBlockExplorerAddressLink } from "@/utils/scaffold-eth";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const textSizeMap = {
  "3xs": "text-[10px]",
  "2xs": "text-[11px]",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
} as const;

const blockieSizeMap = {
  "3xs": 4,
  "2xs": 5,
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
  "4xl": 17,
  "5xl": 19,
  "6xl": 21,
  "7xl": 23,
} as const;

const copyIconSizeMap = {
  "3xs": "h-2.5 w-2.5",
  "2xs": "h-3 w-3",
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  base: "h-[18px] w-[18px]",
  lg: "h-5 w-5",
  xl: "h-[22px] w-[22px]",
  "2xl": "h-6 w-6",
  "3xl": "h-[26px] w-[26px]",
  "4xl": "h-7 w-7",
} as const;

type SizeMap = typeof textSizeMap | typeof blockieSizeMap;

const getNextSize = <T extends SizeMap>(sizeMap: T, currentSize: keyof T, step = 1): keyof T => {
  const sizes = Object.keys(sizeMap) as Array<keyof T>;
  const currentIndex = sizes.indexOf(currentSize);
  const nextIndex = Math.min(currentIndex + step, sizes.length - 1);
  return sizes[nextIndex];
};

const getPrevSize = <T extends SizeMap>(sizeMap: T, currentSize: keyof T, step = 1): keyof T => {
  const sizes = Object.keys(sizeMap) as Array<keyof T>;
  const currentIndex = sizes.indexOf(currentSize);
  const prevIndex = Math.max(currentIndex - step, 0);
  return sizes[prevIndex];
};

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  onlyEnsOrAddress?: boolean;
};

export const Address = ({
  address,
  disableAddressLink,
  format,
  size = "base",
  onlyEnsOrAddress = false,
}: AddressProps) => {
  const checkSumAddress = address ? getAddress(address) : undefined;

  const { targetNetwork } = useTargetNetwork();

  const { data: ens, isLoading: isEnsNameLoading } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    query: {
      enabled: isAddress(checkSumAddress ?? ""),
    },
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ens ? normalize(ens) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(ens),
      gcTime: 30_000,
    },
  });

  const shortAddress = checkSumAddress?.length === 42
    ? checkSumAddress.slice(0, 6) + "..." + checkSumAddress.slice(-4)
    : checkSumAddress;
  const displayAddress = format === "long" ? checkSumAddress : shortAddress;

  const displayEnsOrAddress = ens || displayAddress;

  const showSkeleton = !checkSumAddress || (!onlyEnsOrAddress && (ens || isEnsNameLoading));

  const addressSize = showSkeleton && !onlyEnsOrAddress ? getPrevSize(textSizeMap, size, 2) : size;
  const ensSize = getNextSize(textSizeMap, addressSize);
  const blockieSize = showSkeleton && !onlyEnsOrAddress ? getNextSize(blockieSizeMap, addressSize, 4) : addressSize;

  if (!checkSumAddress) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1">
          {!onlyEnsOrAddress && (
            <Skeleton className={cn("h-4 w-24", textSizeMap[ensSize])} />
          )}
          <Skeleton className={cn("h-4 w-32", textSizeMap[addressSize])} />
        </div>
      </div>
    );
  }

  if (!isAddress(checkSumAddress)) {
    return <span className="text-destructive">Wrong address</span>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(targetNetwork, checkSumAddress);
  console.log(onlyEnsOrAddress);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        <BlockieAvatar
          address={checkSumAddress}
          ensImage={ensAvatar}
          size={(blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"]}
        />
      </div>
      <div className="flex flex-col">
        {showSkeleton && (
          isEnsNameLoading ? (
            <Skeleton className={cn("h-4 w-24", textSizeMap[ensSize])} />
          ) : (
            <AddressLinkWrapper
              disableAddressLink={disableAddressLink}
              blockExplorerAddressLink={blockExplorerAddressLink}
              className={cn("font-semibold", textSizeMap[ensSize])}
            >
              {ens}
            </AddressLinkWrapper>
          )
        )}
        <div className="flex items-center gap-1">
          <AddressLinkWrapper
            disableAddressLink={disableAddressLink}
            blockExplorerAddressLink={blockExplorerAddressLink}
            className={cn("font-mono", textSizeMap[addressSize])}
          >
            {onlyEnsOrAddress ? displayEnsOrAddress : displayAddress}
          </AddressLinkWrapper>
          <AddressCopyIcon
            className={copyIconSizeMap[addressSize]}
            address={checkSumAddress}
          />
        </div>
      </div>
    </div>
  );
};
