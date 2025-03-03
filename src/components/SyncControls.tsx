
import React from "react";
import { cn } from "@/lib/utils";
import { Play, RotateCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SyncControlsProps {
  isMonitoring: boolean;
  onMonitoringChange: (value: boolean) => void;
  onSyncNow: () => void;
  onStart: () => void;
  canStart: boolean;
  className?: string;
}

const SyncControls = ({
  isMonitoring,
  onMonitoringChange,
  onSyncNow,
  onStart,
  canStart,
  className,
}: SyncControlsProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        <Switch
          checked={isMonitoring}
          onCheckedChange={onMonitoringChange}
        />
        <span className="font-medium text-sm">Start monitoring</span>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSyncNow}
          disabled={!canStart}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-input bg-white hover:bg-accent/50 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <RotateCw className="h-4 w-4" />
          <span className="font-medium text-sm">Sync Now</span>
        </button>
        
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Play className="h-4 w-4" />
          <span className="font-medium text-sm">Start</span>
        </button>
      </div>
    </div>
  );
};

export default SyncControls;
