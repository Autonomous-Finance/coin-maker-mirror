"use client";
import { WobbleCard } from "@/components/ui/wobble-card";

export default function Features() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 max-w-7xl mx-auto w-full">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-purple-800 min-h-[500px] lg:min-h-[300px]"
        className=""
      >
        <div className="max-w-xs">
          <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Effortless Token Deployment
          </h2>
          <p className="mt-4 text-left  text-base/6 text-neutral-200">
            Deploy your tokens with just a few clicks using our intuitive dApp
            interface. No complex coding required, making token creation
            accessible for everyone.
          </p>
        </div>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 lg:col-span-4 min-h-[300px]">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Automated Compliance and Verification
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Ensure your tokens meet all regulatory and compliance standards
          effortlessly. CoinMaker provides automated verification processes,
          keeping your tokens compliant and your deployments worry-free.
        </p>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
        <div className="max-w-sm">
          <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Seamless Integration
          </h2>
          <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
            Integrate your newly deployed tokens with existing systems
            effortlessly. CoinMaker supports a wide range of interoperability
            features, ensuring smooth operation within your digital ecosystem.
          </p>
        </div>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-cyan-900 min-h-[300px]">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Enhanced Security
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Utilize the robust security of Arweave and permaweb to ensure your
          tokens are safely deployed and managed. Benefit from immutable data
          storage and secure transactions.
        </p>
      </WobbleCard>
    </div>
  );
}
