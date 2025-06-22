import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financialvault.app',
  appName: 'Financial Vault',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://advisorly-nine.vercel.app'
  },
  plugins: {
    SMS: {},
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '53612257186-qe67jr2atf8c4ngkitm7bkr2536j6p3i.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0D1117',
      showSpinner: true,
      spinnerColor: '#6366F1'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0D1117'
    }
  },
  android: {
    permissions: [
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.INTERNET'
    ]
  }
};

export default config; 