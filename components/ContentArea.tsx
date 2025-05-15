// frontend/components/ContentArea.tsx
// Use type-only import for React
import type React from "react";
import { cn } from "@/lib/utils";

interface ContentAreaProps {
  children: React.ReactNode;
  className?: string; // Allow overriding/extending styles
}

export function ContentArea({ children, className }: ContentAreaProps) {
  return (
    <div className="w-full px-[15%] pb-6">
      <div
        className={cn(
          "rounded-base bg-[color:var(--chart-1)] border-4 border-black p-4 flex flex-col flex-1 mx-auto min-h-[85vh]",
          className // Allow custom classes
        )}
      >
        {children}
      </div>
    </div>
  );
}
