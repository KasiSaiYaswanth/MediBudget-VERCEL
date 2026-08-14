import React, { ReactNode, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Pill, Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import {
  getUnreadCount,
  generateDailyHealthTip,
  generateCheckupReminder,
} from "@/lib/notificationService";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { OfflineBanner } from "@/components/offline/OfflineBanner";
import BottomNavigation from "@/mobile-navigation/BottomNavigation";
import { useRealtimeSync } from "@/context/RealtimeSyncContext";

interface MobileDashboardLayoutProps {
  children: ReactNode;
}

export const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({ children }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isOnline, wasOffline } = useNetworkStatus();
  const { syncNow } = useOfflineSync();
  const { syncStatus } = useRealtimeSync();

  const renderSyncBadge = () => {
    switch (syncStatus) {
      case "synced":
        return <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">● Synced</span>;
      case "syncing":
        return <span className="text-[9px] text-teal-400 font-bold flex items-center gap-1 animate-pulse">↻ Syncing...</span>;
      case "offline":
        return <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1">▲ Offline</span>;
      case "reconnecting":
        return <span className="text-[9px] text-amber-400 font-bold flex items-center gap-1 animate-pulse">○ Reconnecting...</span>;
      case "connection_restored":
        return <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 animate-bounce">● Restored</span>;
      default:
        return null;
    }
  };

  useEffect(() => {
    generateDailyHealthTip();
    generateCheckupReminder();
    setUnreadCount(getUnreadCount());
  }, []);

  const handleUnreadChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col gpu-layer">
      {/* Offline sync banner */}
      <OfflineBanner isOnline={isOnline} wasOffline={wasOffline} onRefresh={syncNow} />

      {/* Notification Drawer integration */}
      <NotificationCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUnreadChange={handleUnreadChange}
      />

      {/* Top Mobile Sticky Header */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/40 safe-top px-4 py-3.5 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 active-scale">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
            <Pill className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground tracking-tight leading-none">
              MediBudget
            </span>
            <div className="mt-0.5">{renderSyncBadge()}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick sync display */}
          {!isOnline && (
            <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
          )}
          
          <button
            onClick={() => setNotifOpen(true)}
            className="relative h-9 w-9 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-[1rem] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area with Safe Margin bottom for Bottom Nav */}
      <main className="flex-1 px-4 py-5 pb-24 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Persistence Mobile Bottom Nav */}
      <BottomNavigation />
    </div>
  );
};

export default MobileDashboardLayout;
