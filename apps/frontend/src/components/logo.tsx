import { Link } from "@tanstack/react-router";
import { Package2 } from "lucide-react";

export default function TokenDropLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold">
      <Package2 className="h-6 w-6" />
      <span className="">CoinMaker</span>
    </Link>
  );
}
