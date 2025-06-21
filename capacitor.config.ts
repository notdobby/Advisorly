import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financialvault.app',
  appName: 'Financial Vault',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SMS: {
      permissions: ['READ_SMS', 'RECEIVE_SMS']
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