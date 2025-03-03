
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import AppHeader from "./AppHeader";
import FolderSelect from "./FolderSelect";
import FrequencySlider from "./FrequencySlider";
import SyncControls from "./SyncControls";
import { Separator } from "@/components/ui/separator";
import { invoke } from "@tauri-apps/api/tauri";

const FolderSyncApp = () => {
  const [sourceFolder, setSourceFolder] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");
  const [pollingFrequency, setPollingFrequency] = useState(5);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [status, setStatus] = useState<"ready" | "syncing" | "error" | "idle">("idle");

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

  // Simulate sync operation
  const syncFolders = useCallback(async () => {
    if (!isReadyToSync) return;
    
    setStatus("syncing");
    
    try {
      await invoke('sync_folders', { 
        source: sourceFolder,
        destination: destinationFolder
      });
      
      setStatus("ready");
      toast.success("Folders synchronized successfully");
    } catch (error) {
      console.error("Sync error:", error);
      setStatus("error");
      toast.error(`Sync failed: ${error}`);
    }
  }, [isReadyToSync, sourceFolder, destinationFolder]);

  // Handle start button click
  const handleStart = async () => {
    if (!isReadyToSync) {
      toast.error("Please select both source and destination folders");
      return;
    }
    
    try {
      // Enable monitoring toggle
      setIsMonitoring(true);
      
      // Tell Tauri backend to start monitoring
      await invoke('start_monitoring');
      
      // Set polling frequency
      await invoke('set_polling_frequency', { frequency: pollingFrequency });
      
      // Perform initial sync
      await syncFolders();
      
      toast.success(`Monitoring started with ${pollingFrequency}s interval`);
    } catch (error) {
      console.error("Start monitoring error:", error);
      toast.error(`Failed to start monitoring: ${error}`);
      setIsMonitoring(false);
    }
  };

  // Handle monitoring toggle change
  const handleMonitoringChange = async (checked: boolean) => {
    setIsMonitoring(checked);
    
    try {
      if (checked) {
        // Start monitoring
        if (isReadyToSync) {
          await invoke('start_monitoring');
          await invoke('set_polling_frequency', { frequency: pollingFrequency });
          toast.success(`Monitoring started with ${pollingFrequency}s interval`);
        }
      } else {
        // Stop monitoring
        await invoke('stop_monitoring');
        toast.info("Monitoring stopped");
      }
    } catch (error) {
      console.error("Monitoring toggle error:", error);
      toast.error(`Monitoring control failed: ${error}`);
      setIsMonitoring(!checked); // Reset to previous state
    }
  };

  // Handle frequency change
  const handleFrequencyChange = async (value: number) => {
    setPollingFrequency(value);
    
    // Update interval if monitoring is active
    if (isMonitoring) {
      try {
        await invoke('set_polling_frequency', { frequency: value });
        toast.success(`Polling frequency updated to ${value}s`);
      } catch (error) {
        console.error("Frequency update error:", error);
        toast.error(`Failed to update frequency: ${error}`);
      }
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
            onBrowse={() => {}} // Handled directly in FolderSelect component now
          />
          
          <FolderSelect
            label="Destination Folder"
            placeholder="Select destination folder"
            value={destinationFolder}
            onChange={setDestinationFolder}
            onBrowse={() => {}} // Handled directly in FolderSelect component now
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
