import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  className,
}) => {
  const getInitials = (str: string) => {
    if (!str) return "?";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const getColorClass = (str: string) => {
    const colors = [
      "bg-teal-600 text-white",
      "bg-amber-600 text-white",
      "bg-indigo-600 text-white",
      "bg-rose-600 text-white",
      "bg-sky-600 text-white",
      "bg-emerald-600 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-xs font-semibold",
    lg: "w-10 h-10 text-sm font-semibold",
    xl: "w-12 h-12 text-base font-semibold",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none border border-white/20 dark:border-slate-800",
        sizes[size],
        !src && getColorClass(name),
        className
      )}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide broken image on error
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
