import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const WrongNetworkDropdown = () => {
    const { disconnect } = useDisconnect();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="destructive"
                    className="h-5 bg-chart-5 text-foreground rounded-full"
                >
                    Wrong network
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl"
                sideOffset={4}
                avoidCollisions={false}
            >
                <NetworkOptions />
                <DropdownMenuItem
                    className="text-destructive focus:text-white focus:bg-destructive rounded-lg"
                    onClick={() => disconnect()}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
