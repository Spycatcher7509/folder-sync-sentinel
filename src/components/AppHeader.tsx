
import React from "react";
import { cn } from "@/lib/utils";
import { Files } from "lucide-react";
import StatusIndicator from "./StatusIndicator";

interface AppHeaderProps {
  status: "ready" | "syncing" | "error" | "idle";
  className?: string;
}

const AppHeader = ({ status, className }: AppHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-primary">
          <Files className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">File Sync</h1>
      </div>
      
      <StatusIndicator status={status} />
    </div>
  );
};

export default AppHeader;
