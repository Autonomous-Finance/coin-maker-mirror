import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

dayjs.extend(relativeTime);

export default function DisplayVestedPeriod({ vested }: { vested: number }) {
  const end = dayjs().add(vested, "days");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{end.fromNow()}</div>
        </TooltipTrigger>
        <TooltipContent>
          Coins vested until {end.format("MMMM D, YYYY")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
