"use client";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, showLabel = true, className = "" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 bg-app-border rounded-full h-1.5 overflow-hidden"
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${clamped}%`,
            backgroundColor: clamped === 100 ? "#22c55e" : "#0078D4",
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-app-muted w-8 text-right shrink-0">{clamped}%</span>
      )}
    </div>
  );
}

export function calcProgress(total: number, completed: number): number {
  if (total === 0) return 0;
  return Math.floor((completed / total) * 100);
}
