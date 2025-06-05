import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mapbreak.app',
  appName: 'MapBreak',
  webDir: 'dist',
  
  // Enhanced server configuration for mobile debugging
  server: {
    androidScheme: 'https',
    // Uncomment these for development/debugging only:
    // url: 'http://localhost:5173', // For live reload during development
    // cleartext: true,
    allowNavigation: [
      '*', // Allow all navigation for auth flows
    ],
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
    },
    
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  
  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff',
  },
  
  // Android specific configuration
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Enable debugging
  },
};

export default config;