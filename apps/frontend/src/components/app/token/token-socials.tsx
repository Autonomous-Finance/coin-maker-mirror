import { useToken } from "@/hooks/use-token";
import { GlobeIcon } from "@radix-ui/react-icons";
import { SendIcon, XIcon } from "lucide-react";

export default function TokenSocials() {
  const { token } = useToken();

  const socials = Array.isArray(token.SocialLinks)
    ? token.SocialLinks
    : (Object.entries(token.SocialLinks).map(([key, value]) => ({
        key,
        value,
      })) as { key: string; value: string }[]);
  const twitter = socials.find((link) => link.key === "Twitter");
  const telegram = socials.find((link) => link.key === "Telegram");
  const website = socials.find((link) => link.key === "Website");
  const others = socials.filter(
    (link) =>
      link.key !== "Twitter" &&
      link.key !== "Telegram" &&
      link.key !== "Website"
  );

  return (
    <div className="space-y-6">
      <fieldset className="rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-lg font-bold">Token Metadata</legend>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-1 text-sm font-mono mb-2">
              <XIcon className="w-4" />
              Twitter / X
            </div>
            <div className="text-sm">{twitter?.value || "N/A"}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm font-mono mb-2">
              <SendIcon className="w-4" />
              Telegram
            </div>
            <div className="text-sm">{telegram?.value || "N/A"}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm font-mono mb-2">
              <GlobeIcon className="w-4" />
              Website
            </div>
            <div className="text-sm">{website?.value || "N/A"}</div>
          </div>

          {others.map((link) => (
            <div key={link.key}>
              <div className="flex items-center gap-1 text-sm font-mono mb-2 capitalize">
                {link.key}
              </div>
              <div className="text-sm">{link.value}</div>
            </div>
          ))}

          <div>
            <div className="flex items-center gap-1 text-sm font-mono mb-2">
              Description
            </div>
            <div className="text-sm">{token.Description}</div>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
