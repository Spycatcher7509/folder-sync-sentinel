
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock, Zap } from "lucide-react";

interface FrequencySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const FrequencySlider = ({
  value,
  onChange,
  min = 1,
  max = 60,
  step = 1,
  className,
}: FrequencySliderProps) => {
  const [fillWidth, setFillWidth] = useState("0%");

  useEffect(() => {
    const percentage = ((value - min) / (max - min)) * 100;
    setFillWidth(`${percentage}%`);
  }, [value, min, max]);

  const formatValue = (val: number) => {
    return val === 1 ? "1s" : `${val}s`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Polling Frequency</h3>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          <span>{formatValue(value)}</span>
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute top-0 left-0 h-1 bg-primary rounded-full z-0 transition-all duration-200 ease-out"
          style={{ width: fillWidth }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatValue(min)}</span>
        <button
          type="button"
          onClick={() => onChange(Math.floor((max - min) / 4))}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent hover:bg-accent/70 transition-colors duration-200"
        >
          <Zap className="h-4 w-4" />
          <span className="font-medium">Fast</span>
        </button>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default FrequencySlider;
