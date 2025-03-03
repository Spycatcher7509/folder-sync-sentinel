
import React from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface StatusIndicatorProps {
  status: "ready" | "syncing" | "error" | "idle";
  className?: string;
}

const statusConfig = {
  ready: {
    text: "Ready to sync",
    icon: Clock,
    className: "bg-accent text-accent-foreground",
  },
  syncing: {
    text: "Syncing...",
    icon: Clock,
    className: "bg-primary/10 text-primary animate-pulse-subtle",
  },
  error: {
    text: "Sync error",
    icon: Clock,
    className: "bg-destructive/10 text-destructive",
  },
  idle: {
    text: "Waiting for folders",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
};

const StatusIndicator = ({ status, className }: StatusIndicatorProps) => {
  const config = statusConfig[status];
  
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 animate-fade-in",
        config.className,
        className
      )}
    >
      <config.icon className="h-4 w-4" />
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
};

export default StatusIndicator;
