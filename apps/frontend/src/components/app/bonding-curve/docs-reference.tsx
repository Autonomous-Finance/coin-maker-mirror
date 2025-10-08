import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookIcon } from "lucide-react";


export default function BondingCurveDocsRef() {
  return (
    <div className="text-center text-lg px-4 py-4 rounded-lg flex items-center justify-center">
      <span>Check out our</span>
      <a
        href={`https://docs.autonomous.finance/products/platforms/coinmaker/bonding-curve`}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: "link" }), "px-1 py-0 max-h-min")}
      >
      <BookIcon className="text-[#9B86FD] h-4 w-4 mr-1"/> 
      <span className="text-[#9B86FD] text-lg">docs</span>
      </a>
      <span>to better understand the bonding curve and its design.</span>
    </div>
  )
}
