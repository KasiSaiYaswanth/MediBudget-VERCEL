import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Sparkles, Scan, Calculator, Settings } from "lucide-react";

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
  { label: "Estimate", path: "/estimate", icon: Calculator },
  { label: "Settings", path: "/settings", icon: Settings },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mobile-glass safe-bottom border-t border-border/40 pb-2">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4 relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.isFab) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative -top-5 flex flex-col items-center justify-center z-50 group"
              >
                <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center shadow-glow active-scale pulse-ring">
                  <item.icon className="h-6 w-6 text-primary-foreground transform group-hover:rotate-12 transition-transform" />
                </div>
                <span className="text-[10px] font-semibold text-primary mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-12 h-12 transition-all active-scale ${
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[9px] font-medium mt-1">{item.label}</span>
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
