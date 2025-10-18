import Constants from 'expo-constants';

const config = {
  // Backend API Configuration
  API_BASE_URL: __DEV__
    ? 'http://192.168.1.7:3000'  // Local development (laptop + mobile testing)
    : ' https://techathon-2.onrender.com', // Ngrok tunnel for testing builds

  APP_NAME: 'XONIGHT',
  APP_VERSION: '1.0.0',
};

export default config;