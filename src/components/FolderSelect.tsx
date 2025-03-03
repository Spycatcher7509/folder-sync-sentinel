
import React from "react";
import { cn } from "@/lib/utils";
import { Folder } from "lucide-react";

interface FolderSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBrowse: () => void;
  className?: string;
}

const FolderSelect = ({
  label,
  placeholder,
  value,
  onChange,
  onBrowse,
  className,
}: FolderSelectProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-lg font-medium">{label}</h3>
      <div className="relative flex items-center w-full rounded-lg border border-input bg-white shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <div className="flex items-center gap-3 flex-1 px-4 py-3">
          <Folder className="h-6 w-6 text-muted-foreground/70" />
          <input
            type="text"
            className="flex-1 border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={onBrowse}
          className="h-full px-4 py-3 flex items-center justify-center font-medium text-sm text-primary bg-accent/50 hover:bg-accent transition-colors duration-200 rounded-r-lg"
        >
          Browse
        </button>
      </div>
    </div>
  );
};

export default FolderSelect;
