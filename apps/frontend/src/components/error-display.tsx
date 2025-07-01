import type React from "react";

export default function ErrorDisplay({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="container">
      <div className="flex items-center justify-center h-96">
        <p className="text-lg text-red-500">{children}</p>
      </div>
    </div>
  );
}
