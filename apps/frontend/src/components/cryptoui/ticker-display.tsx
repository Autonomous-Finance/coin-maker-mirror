import type React from "react";

export default function TickerDisplay({
  children,
}: {
  children: React.ReactNode;
}) {
  return <span className="font-mono">${children}</span>;
}
