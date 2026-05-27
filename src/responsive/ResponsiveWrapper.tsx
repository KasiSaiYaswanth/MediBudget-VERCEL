import React, { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Initial check
    const isNative = Capacitor.isNativePlatform();
    const isSmallScreen = typeof window !== "undefined" && window.innerWidth <= 768;
    return isNative || isSmallScreen;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      const isNative = Capacitor.isNativePlatform();
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isNative || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

interface ResponsiveWrapperProps {
  desktop: React.ComponentType<any>;
  mobile: React.ComponentType<any>;
  [key: string]: any;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  desktop: DesktopComponent,
  mobile: MobileComponent,
  ...props
}) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileComponent {...props} /> : <DesktopComponent {...props} />;
};

export default ResponsiveWrapper;
