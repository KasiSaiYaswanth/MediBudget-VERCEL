import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medibudget.app',
  appName: 'MediBudget',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#070e11",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
