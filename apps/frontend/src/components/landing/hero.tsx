import { Link } from "@tanstack/react-router";
import { FlipWords } from "../ui/flip-words";
import ShineBorder from "../ui/shine-border";

export default function HeroVortex() {
  const words = [
    "verified",
    "secure",
    "unique",
    "dynamic",
    "flexible",
    "reliable",
    "trusted",
  ];

  return (
    <div className="h-[48rem] w-full rounded-md flex md:items-center md:justify-center antialiased relative overflow-hidden ">
      <div className="p-4 max-w-5xl mx-auto relative z-10 w-full">
        <div className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 text-center py-4">
          Create
          <FlipWords words={words} />
          coins
        </div>

        <div className="text-3xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 text-center">
          Create and list a coin in under 2 minutes
        </div>

        <div className="flex justify-center items-center gap-4 mt-16 bg-accent-gradient ">
          <Link to="/create-token">
            <ShineBorder
              className="text-center text-2xl font-bold"
              color={["#2B14C8", "#98C4D3", "#4B0885"]}
            >
              Start a new Coin
            </ShineBorder>
          </Link>
        </div>
      </div>
    </div>
  );
}
