import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import React from "react";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {

	return (
    <SliderPrimitive.Root
      className={cn("relative flex items-center user-select-none touch-action-none w-[254px] h-[20px]", className)}
      {...props}
      ref={ref}
      >
      <SliderPrimitive.Track className="relative bg-white/20 flex-grow rounded-full h-[3px]">
        <SliderPrimitive.Range className="absolute bg-white rounded-full h-[100%]"/>
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-[20px] h-[20px] bg-violet-600 shadow-[0_2px_10px_0_black/70] rounded-full hover:bg-white hover:cursor-pointer focus:outline-none focus:shadow-[0_0_0_5px_black/80]"/>
    </SliderPrimitive.Root>
  )
});

export default Slider