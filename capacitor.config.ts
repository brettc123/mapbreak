import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mapbreak.app',
  appName: 'Map Break',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },  // ← Added closing brace and comma here
  server: {
    androidScheme: 'https'
  }
};

export default config;