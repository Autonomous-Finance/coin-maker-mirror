import CopyButton from "@/components/cryptoui/copy-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

interface HashDisplayProps {
  hash: string;
  format?: "full" | "short";
  copyButton?: boolean;
  link?: string;
}

export default function HashDisplay({
  hash,
  format = "short",
  copyButton = false,
  link,
}: HashDisplayProps) {
  const displayHash =
    format === "full" ? hash : `${hash.slice(0, 10)}...${hash.slice(-10)}`;

  if (link) {
    return (
      <div className="flex items-center">
        {copyButton && <CopyButton value={hash} />}
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "link" }))}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono">{displayHash}</span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-mono">{hash}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {copyButton && <CopyButton value={hash} />}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono">{displayHash}</span>
          </TooltipTrigger>
          <TooltipContent>
            <span className="font-mono">{hash}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
