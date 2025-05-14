// frontend/components/ContentArea.tsx
// Use type-only import for React
import type React from 'react';
import { cn } from '@/lib/utils';

interface ContentAreaProps {
  children: React.ReactNode;
  className?: string; // Allow overriding/extending styles
}

export function ContentArea({ children, className }: ContentAreaProps) {
  return (
    <div 
      className={cn(
        // Use styles from dashboard main content area
        "rounded-base bg-background/50 border-2 border-border p-4 flex flex-col flex-1 container mx-auto", 
        className // Allow custom classes
      )}
    >
      {children}
    </div>
  );
}
