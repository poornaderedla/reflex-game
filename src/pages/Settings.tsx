
import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import Layout from "@/components/layout/Layout";
import Heading from "@/components/ui/heading";
import { Trash2 } from "lucide-react";

const Settings: React.FC = () => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const handleResetData = () => {
    localStorage.clear();
    setShowConfirmReset(false);
    setResetSuccess(true);
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Heading as="h1">Settings</Heading>
        
        <div className="rounded-xl border border-luxury-white/10 bg-card p-4">
          <h2 className="mb-4 text-lg font-medium">App Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-luxury-white/70">Reset Data</h3>
              <p className="mt-1 text-sm text-luxury-white/50">
                This will reset all your game scores and settings.
              </p>
              
              {!showConfirmReset && !resetSuccess && (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="mt-3 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-500 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Reset All Data</span>
                </button>
              )}
              
              {showConfirmReset && (
                <div className="mt-3 space-y-3 rounded-md border border-luxury-white/10 bg-luxury-black p-4">
                  <p className="text-sm text-luxury-white">
                    Are you sure? This action cannot be undone.
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleResetData}
                      className="flex-1 rounded-md bg-red-500 py-2 text-sm text-white"
                    >
                      Yes, Reset
                    </button>
                    
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="flex-1 rounded-md border border-luxury-white/20 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {resetSuccess && (
                <p className="mt-3 rounded-md bg-green-500/10 p-3 text-sm text-green-500">
                  All data has been reset. Refreshing...
                </p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-luxury-white/70">About</h3>
              <div className="mt-2 space-y-1 text-sm text-luxury-white/50">
                <p>Reflex Elite</p>
                <p>Version 1.0.0</p>
                <p className="mt-3">
                  A luxury reaction training platform designed to improve cognitive reflexes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
