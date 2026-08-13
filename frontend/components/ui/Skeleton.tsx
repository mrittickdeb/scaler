import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  variant?: "line" | "circle" | "card";
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "line",
  className,
}) => {
  const variants = {
    line: "h-4 w-full rounded-md",
    circle: "h-10 w-10 rounded-full shrink-0",
    card: "h-24 w-full rounded-xl",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/80 shadow-xs",
        variants[variant],
        className
      )}
    />
  );
};
