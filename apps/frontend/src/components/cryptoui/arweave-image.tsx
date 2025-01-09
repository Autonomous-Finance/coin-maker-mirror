import useTokenLogo from "@/hooks/use-token-logo";
import { cn } from "@/lib/utils";
import { Package2 } from "lucide-react";

export default function ArweaveImage({
  className,
  src,
  alt,
}: { className?: string; src: string; alt?: string }) {
  const { data } = useTokenLogo(src);

  if (!data || src === "") {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary rounded-full w-12 h-12 text-muted-foreground",
          className,
        )}
      >
        <Package2 />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full w-12 h-12 border flex items-center",
        className,
      )}
    >
      <img
        src={data}
        className={cn("rounded-full object-cover w-12 h-12", className)}
        alt={alt || src}
      />
    </div>
  );
}
