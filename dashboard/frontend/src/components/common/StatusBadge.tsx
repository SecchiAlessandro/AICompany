import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS["NOT STARTED"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        colors.bg,
        colors.border,
        colors.text,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      )}
    >
      <span
        className={cn(
          "rounded-full",
          colors.dot,
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          status === "PENDING" || status === "IN PROGRESS" ? "animate-status-pulse" : ""
        )}
      />
      {status}
    </span>
  );
}
