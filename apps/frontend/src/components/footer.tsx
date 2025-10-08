import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import ENV from "@/env";

export default function Footer() {
  const appVersion = ENV.VITE_APP_VER ?? '{ "frontend": "0.0.0" }';
  const parsedAppVersion = JSON.parse(appVersion);

  const gitHash = (ENV.VITE_GIT_HASH ?? "").substring(0, 6) ?? "0000000";
  const environment = ENV.VITE_ENV ?? "staging";

  return (
    <div className="fixed bottom-0 w-full">
      <div className="container flex items-center justify-between text-muted-foreground gap-2 bg-slate-950">
        <div>
          <a
            className={cn(buttonVariants({ variant: "link" }))}
            href="https://dexi.defi.ao"
            target="_blank"
            rel="noreferrer"
          >
            Dexi
          </a>
          <a
            className={cn(buttonVariants({ variant: "link" }))}
            href="https://botega.defi.ao"
            target="_blank"
            rel="noreferrer"
          >
            Botega
          </a>
          <a
            className={cn(buttonVariants({ variant: "link" }))}
            href="https://docs.autonomous.finance/products/platforms/coinmaker"
            target="_blank"
            rel="noreferrer"
          >
            Documentation
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm justify-end">
          <span>v{parsedAppVersion.frontend}</span>
          &middot;
          <span>{gitHash}</span>
          &middot;
          <span>{environment}</span>
        </div>
        <div className="flex items-center text-sm font-mono">
          Powered by
          <a
            href="https://autonomous.finance/"
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "link" }),
              "flex items-center font-mono text-muted-foreground gap-1"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="14"
              viewBox="0 0 30 14"
              fill="none"
              color="var(--mui-palette-text-primary)"
            >
              <title>Autonomous Finance Logo</title>
              <path
                d="M14.2808 6.97425L20.0172 13.8772C20.0819 13.9552 20.1762 14 20.2753 14H27.7542C28.0357 14 28.1961 13.6655 28.0265 13.4319L21.3599 4.25C17.5864 4.24791 16.2092 5.0278 14.2808 6.97425Z"
                fill="url(#paint0_linear_2001_94)"
              />
              <path
                d="M21.4282 3.59629C18.0158 -1.10355 11.2239 -1.10355 7.81151 3.59629L0.874136 13.1511C0.704531 13.3846 0.864881 13.7192 1.14647 13.7192H9.48443C9.59302 13.7192 9.69517 13.6654 9.75944 13.5744L14.6199 6.69344C16.5483 4.747 17.9255 3.96711 21.699 3.9692L21.4282 3.59629Z"
                fill="url(#paint1_linear_2001_94)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_2001_94"
                  x1="17.6924"
                  y1="5.49091"
                  x2="30.9729"
                  y2="20.0498"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop />
                  <stop offset="1" stop-color="#666666" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_2001_94"
                  x1="1.65573"
                  y1="13.7192"
                  x2="13.2728"
                  y2="-0.586789"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop />
                  <stop offset="1" stop-color="#9C9C9C" />
                </linearGradient>
              </defs>
            </svg>
            AUTONOMOUS.FINANCE
          </a>
          <a
            href="https://discord.com/invite/AK6C2PPWDc"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-muted-foreground hover:text-white px-1"
            )}
          >
            <DiscordLogoIcon className="size-5" />
          </a>
          <a
            href="https://twitter.com/autonomous_af"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-muted-foreground hover:text-white px-1"
            )}
            target="_blank"
            rel="noreferrer"
          >
            <svg
              focusable="false"
              aria-hidden="true"
              viewBox="0 0 24 24"
              data-testid="XIcon"
              fill="currentColor"
              className="size-4"
            >
              <title>X Logo</title>
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden">X</span>
          </a>
        </div>
      </div>
    </div>
  );
}
