import { CopyCheck, CopyIcon } from "lucide-react";
import React from "react";

export default function CopyButton({ value, size }: { value: string, size?: number }) {
  const [copied, setCopied] = React.useState(false);

  const onClick = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (copied) {
    return <CopyCheck className={`size-${size ?? 4} text-primary`} />;
  }

  return (
    <CopyIcon
      className={`size-${size ?? 4} cursor-pointer hover:text-purple-400`}
      onClick={onClick}
    />
  );
}
