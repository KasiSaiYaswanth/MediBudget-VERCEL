import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Sparkles, Scan, Shield, History, Settings } from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  isFab?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/dashboard", icon: LayoutDashboard },
  { label: "AI Chat", path: "/symptoms", icon: Sparkles },
  { label: "Scan", path: "/scanner", icon: Scan, isFab: true },
  { label: "Insurance", path: "/insurance", icon: Shield },
  { label: "History", path: "/history", icon: History },
  { label: "Settings", path: "/settings", icon: Settings },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mobile-glass safe-bottom border-t border-border/40 pb-2">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2 relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.isFab) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-end w-12 h-12 pb-0.5 relative z-50 group shrink-0"
              >
                <div className="h-12 w-12 absolute -top-4 rounded-full gradient-primary flex items-center justify-center shadow-glow active-scale pulse-ring border-3 border-background bg-card">
                  <item.icon className="h-5 w-5 text-primary-foreground transform group-hover:rotate-12 transition-transform" />
                </div>
                <span className="text-[8px] font-bold text-primary tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-11 h-11 transition-all active-scale shrink-0 ${
                isActive ? "text-primary scale-105 font-bold" : "text-muted-foreground hover:text-foreground font-semibold"
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              <span className="text-[8px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
