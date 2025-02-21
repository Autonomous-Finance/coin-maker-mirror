import { Package2 } from "lucide-react";
import OrbitingCircles from "./ui/orbiting-circles";

export default function LoadingState({
  title,
  subtitle,
}: { title: string; subtitle?: string }) {
  return (
    <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden">
      <div className="flex flex-col">
        <span className="pointer-events-none whitespace-pre-wrap text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 text-center py-4">
          {title}
        </span>

        {subtitle ? (
          <span className="pointer-events-none whitespace-pre-wrap text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 text-center py-4">
            {subtitle}
          </span>
        ) : null}
      </div>

      {/* Inner Circles */}
      <OrbitingCircles
        className="h-[30px] w-[30px] border-none bg-transparent"
        duration={20}
        delay={20}
        radius={80}
      >
        <Package2 />
      </OrbitingCircles>
      <OrbitingCircles
        className="h-[30px] w-[30px] border-none bg-transparent"
        duration={20}
        delay={10}
        radius={80}
      >
        <Package2 />
      </OrbitingCircles>

      {/* Outer Circles (reverse) */}
      <OrbitingCircles
        className="h-[50px] w-[50px] border-none bg-transparent"
        reverse
        radius={190}
        duration={20}
      >
        <Package2 />
      </OrbitingCircles>
      <OrbitingCircles
        className="h-[50px] w-[50px] border-none bg-transparent"
        reverse
        radius={190}
        duration={20}
        delay={20}
      >
        <Package2 />
      </OrbitingCircles>
    </div>
  );
}
