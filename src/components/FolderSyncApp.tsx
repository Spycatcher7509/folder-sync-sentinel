
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import AppHeader from "./AppHeader";
import FolderSelect from "./FolderSelect";
import FrequencySlider from "./FrequencySlider";
import SyncControls from "./SyncControls";
import { Separator } from "@/components/ui/separator";

const FolderSyncApp = () => {
  const [sourceFolder, setSourceFolder] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");
  const [pollingFrequency, setPollingFrequency] = useState(5);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [status, setStatus] = useState<"ready" | "syncing" | "error" | "idle">("idle");
  const [syncInterval, setSyncInterval] = useState<number | null>(null);

  // Check if ready to sync
  const isReadyToSync = sourceFolder && destinationFolder;

  // Update status based on folder selections
  useEffect(() => {
    if (sourceFolder && destinationFolder) {
      setStatus("ready");
    } else {
      setStatus("idle");
    }
  }, [sourceFolder, destinationFolder]);

  // Clear any active intervals when component unmounts
  useEffect(() => {
    return () => {
      if (syncInterval) {
        window.clearInterval(syncInterval);
      }
    };
  }, [syncInterval]);

  // Handle folder browsing (in a real app, this would open a file picker)
  const handleBrowseSource = () => {
    // Mock folder selection
    setSourceFolder("/Users/Documents/Source");
    toast.success("Source folder selected");
  };

  const handleBrowseDestination = () => {
    // Mock folder selection
    setDestinationFolder("/Users/Documents/Destination");
    toast.success("Destination folder selected");
  };

  // Simulate sync operation
  const syncFolders = useCallback(() => {
    if (!isReadyToSync) return;
    
    setStatus("syncing");
    
    // Simulate sync process with timeout
    setTimeout(() => {
      setStatus("ready");
      toast.success("Folders synchronized successfully");
    }, 1500);
  }, [isReadyToSync]);

  // Handle start button click
  const handleStart = () => {
    if (!isReadyToSync) {
      toast.error("Please select both source and destination folders");
      return;
    }
    
    // Enable monitoring toggle
    setIsMonitoring(true);
    
    // Perform initial sync
    syncFolders();
    
    // Set up interval for continuous monitoring
    const interval = window.setInterval(() => {
      syncFolders();
    }, pollingFrequency * 1000);
    
    setSyncInterval(interval);
    toast.success(`Monitoring started with ${pollingFrequency}s interval`);
  };

  // Handle monitoring toggle change
  const handleMonitoringChange = (checked: boolean) => {
    setIsMonitoring(checked);
    
    if (checked) {
      // Start monitoring
      if (!syncInterval && isReadyToSync) {
        const interval = window.setInterval(() => {
          syncFolders();
        }, pollingFrequency * 1000);
        
        setSyncInterval(interval);
        toast.success(`Monitoring started with ${pollingFrequency}s interval`);
      }
    } else {
      // Stop monitoring
      if (syncInterval) {
        window.clearInterval(syncInterval);
        setSyncInterval(null);
        toast.info("Monitoring stopped");
      }
    }
  };

  // Handle frequency change
  const handleFrequencyChange = (value: number) => {
    setPollingFrequency(value);
    
    // Update interval if monitoring is active
    if (isMonitoring && syncInterval) {
      window.clearInterval(syncInterval);
      
      const newInterval = window.setInterval(() => {
        syncFolders();
      }, value * 1000);
      
      setSyncInterval(newInterval);
      toast.success(`Polling frequency updated to ${value}s`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="rounded-2xl bg-white shadow-sm border p-6 space-y-6 transition-all duration-300 hover:shadow-md">
        <AppHeader status={status} />
        
        <Separator className="my-4" />
        
        <div className="space-y-6 animate-slide-in" style={{ animationDelay: "0.1s" }}>
          <FolderSelect
            label="Source Folder"
            placeholder="Select source folder to monitor"
            value={sourceFolder}
            onChange={setSourceFolder}
            onBrowse={handleBrowseSource}
          />
          
          <FolderSelect
            label="Destination Folder"
            placeholder="Select destination folder"
            value={destinationFolder}
            onChange={setDestinationFolder}
            onBrowse={handleBrowseDestination}
          />
          
          <FrequencySlider
            value={pollingFrequency}
            onChange={handleFrequencyChange}
          />
        </div>
        
        <Separator className="my-2" />
        
        <SyncControls
          isMonitoring={isMonitoring}
          onMonitoringChange={handleMonitoringChange}
          onSyncNow={syncFolders}
          onStart={handleStart}
          canStart={isReadyToSync}
        />
      </div>
    </div>
  );
};

export default FolderSyncApp;
