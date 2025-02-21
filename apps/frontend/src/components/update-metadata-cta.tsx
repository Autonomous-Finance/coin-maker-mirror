import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { METADATA_UPDATE_USD_PRICE } from "@/config";
import { useToken } from "@/hooks/use-token";
import { cn } from "@/lib/utils";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export default function UpdateMetadataCTA() {
  const matchRoute = useMatchRoute();
  const { token } = useToken();

  if (
    matchRoute({
      to: "/token/$tokenId/update-metadata",
    })
  ) {
    return null;
  }

  return (
    <Card className="w-full bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Boost Token Visibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">
          Update your token's metadata and watch your project soar!
        </p>
        <ul className="text-xs space-y-1">
          <li className="flex items-center gap-1">
            <span className="text-green-400">✓</span> Increase credibility
          </li>
          <li className="flex items-center gap-1">
            <span className="text-green-400">✓</span> Attract more investors
          </li>
          <li className="flex items-center gap-1">
            <span className="text-green-400">✓</span> Improve discoverability
          </li>
        </ul>
        <Link
          to="/token/$tokenId/update-metadata"
          params={{
            tokenId: token.TokenProcess,
          }}
          className={cn(buttonVariants({ size: "sm", variant: "cta" }))}
        >
          Update for only ${METADATA_UPDATE_USD_PRICE}
        </Link>
      </CardContent>
    </Card>
  );
}
