import { ConnectButtonFancy } from "../ui/connect-button";

export default function SignIn() {
  return (
    <div className="w-full h-[48rem] rounded-md flex md:items-center md:justify-center bg-slate-950 antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="text-3xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          Oopsie, you are not connected
        </h1>
        <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
          In order to use the app, you need to connect your Arweave wallet.
        </p>
        <div className="flex flex-col justify-center sm:flex-row items-center gap-4 mt-16">
          <ConnectButtonFancy />
        </div>
      </div>
    </div>
  );
}
