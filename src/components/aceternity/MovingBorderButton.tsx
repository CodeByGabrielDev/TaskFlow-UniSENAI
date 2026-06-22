"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useRef } from "react";

export function MovingBorderButton({
  children,
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
  ...otherProps
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
  [key: string]: unknown;
}) {
  const pathRef = useRef<SVGRectElement | null>(null);

  return (
    <Component
      className={cn(
        "relative inline-flex h-12 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white",
        containerClassName
      )}
      {...otherProps}
    >
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#6366f1_50%,#3b82f6_100%)]" />
      <span
        className={cn(
          "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-white px-6 py-2 text-sm font-semibold text-gray-900 backdrop-blur-3xl transition-all hover:bg-blue-50",
          className
        )}
      >
        {children}
      </span>
    </Component>
  );
}
