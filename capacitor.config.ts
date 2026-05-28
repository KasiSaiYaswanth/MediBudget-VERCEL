import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medibudget.app',
  appName: 'MediBudget',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#070e11",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
