import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  reserveRatios: number[];
  selectedReserveRatio?: number;
  handlerFunction: (index: number) => void;
}

export default function ReserveRatiosGroup({
  reserveRatios,
  handlerFunction,
  selectedReserveRatio,
}: Props) {
  return (
    <div className={cn(`grid grid-cols-${reserveRatios.length} gap-2`)}>
      {reserveRatios.map((ratio) => (
        <Button
          className="py-2"
          type="button"
          key={ratio}
          variant={
            selectedReserveRatio === ratio
              ? "secondary"
              : "outline"
          }
          onClick={() => handlerFunction(ratio)}
        >
          {ratio}
        </Button>
      ))}
    </div>
  );
}
