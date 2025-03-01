import { ExternalLink } from "lucide-react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const ViewExplorerButton = ({ link }: { link?: string }) => {
    if (!link) return null;

    return (
        <>
            <DropdownMenuItem asChild className="rounded-lg hover:text-white focus:text-white">
                <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
        </>
    );
};
