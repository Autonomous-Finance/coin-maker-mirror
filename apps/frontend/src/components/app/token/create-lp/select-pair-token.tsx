"use client";

import * as React from "react";

import ArweaveImage from "@/components/cryptoui/arweave-image";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PAIR_TOKENS } from "@/config";
import { cn } from "@/lib/utils";
import type { PairToken } from "@/types";

export default function SelectPairToken({
  onHandleSelectToken,
}: { onHandleSelectToken: (pairToken: PairToken) => void }) {
  const [open, setOpen] = React.useState(false);
  const [selectedPairToken, setSelectedPairToken] =
    React.useState<PairToken | null>(PAIR_TOKENS[0]);

  function handleSelectedPairTokenInternal(value: string) {
    const selected =
      PAIR_TOKENS.find((pairToken) => pairToken.TokenProcess === value) || null;

    if (!selected) return;

    setSelectedPairToken(selected);
    setOpen(false);

    onHandleSelectToken(selected);
  }

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm  file:border-0 file:bg-transparent 
                        file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
                        focus-visible:outline-none focus-visible:ring-[2px]  focus-visible:ring-purple-400 dark:focus-visible:ring-purple-600
                         disabled:cursor-not-allowed disabled:opacity-50
                         dark:shadow-[0px_0px_1px_1px_var(--neutral-700)]
                         group-hover/input:shadow-none transition duration-400`}
          >
            {selectedPairToken ? (
              <>
                <ArweaveImage
                  src={selectedPairToken.Logo}
                  alt={selectedPairToken.Name}
                  className="mr-2 h-6 w-6"
                />
                {selectedPairToken.Ticker}
              </>
            ) : (
              <>Select Pair Token</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Change pair token..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {PAIR_TOKENS.map((pairToken) => (
                  <CommandItem
                    key={pairToken.TokenProcess}
                    value={pairToken.TokenProcess}
                    onSelect={(value) => handleSelectedPairTokenInternal(value)}
                  >
                    <ArweaveImage
                      src={pairToken.Logo}
                      className={cn(
                        "mr-2 h-4 w-4",
                        pairToken.TokenProcess ===
                          selectedPairToken?.TokenProcess
                          ? "opacity-100"
                          : "opacity-40",
                      )}
                    />
                    <span>{pairToken.Ticker}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
