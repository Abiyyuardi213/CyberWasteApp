import { Platform } from 'react-native';

export const API_URL = Platform.select({
  ios: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api',
  web: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
}) as string;

console.log('Connecting to API URL:', API_URL);
