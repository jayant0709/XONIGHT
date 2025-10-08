import Constants from 'expo-constants';

const config = {
  // Change this to your Next.js app URL
  // For development, use your local IP address or localhost
  // For production, use your deployed app URL
  API_BASE_URL: __DEV__ 
    ? 'http://192.168.1.7:3000'  // Using your Wi-Fi IP address for mobile testing
    : 'https://your-app-domain.com', // Change to your production domain
    
  APP_NAME: 'XONIGHT',
  APP_VERSION: '1.0.0',
};

export default config;