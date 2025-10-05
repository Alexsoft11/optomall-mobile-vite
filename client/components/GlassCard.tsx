import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl border border-white/40 dark:border-white/10 shadow-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
