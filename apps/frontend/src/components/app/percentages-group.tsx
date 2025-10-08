import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { StarFilledIcon } from "@radix-ui/react-icons";

interface Props {
  percentages: number[] | { value: number; label: string; tooltip?: string }[];
  selectedPercentage?: number;
  handlerFunction: (index: number) => void;
  noPercent?: boolean;
}

export default function PercentagesGroup({
  percentages,
  handlerFunction,
  selectedPercentage,
  noPercent = false,
}: Props) {
  return (
    <div className={cn(`grid grid-cols-${percentages.length} gap-2`)}>
      {percentages.map((percentage) =>
        typeof percentage === "object" && percentage.tooltip ? (
          <TooltipProvider
            key={typeof percentage === "object" ? percentage.value : percentage}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  key={
                    typeof percentage === "object"
                      ? percentage.value
                      : percentage
                  }
                  variant={
                    selectedPercentage === percentage.value
                      ? "secondary"
                      : "outline"
                  }
                  onClick={() =>
                    handlerFunction(
                      typeof percentage === "object"
                        ? percentage.value
                        : percentage
                    )
                  }
                  className="py-2 relative"
                >
                  <StarFilledIcon className="absolute top-2 left-2 w-3 h-3 text-purple-500" />
                  {typeof percentage === "object"
                    ? percentage.label
                    : percentage}
                  {noPercent ? "" : "%"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{percentage.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            type="button"
            key={typeof percentage === "object" ? percentage.value : percentage}
            variant={
              typeof percentage === "object"
                ? selectedPercentage === percentage.value
                  ? "secondary"
                  : "outline"
                : selectedPercentage === percentage
                ? "secondary"
                : "outline"
            }
            onClick={() =>
              handlerFunction(
                typeof percentage === "object" ? percentage.value : percentage
              )
            }
            className="py-2"
          >
            {typeof percentage === "object" ? percentage.label : percentage}
            {noPercent ? "" : "%"}
          </Button>
        )
      )}
    </div>
  );
}
