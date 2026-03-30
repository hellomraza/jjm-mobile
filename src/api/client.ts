import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://jjm-backend.vercel.app';
// const API_BASE_URL = 'http://192.168.1.3:3000';
const ACCESS_TOKEN_KEY = 'access_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    return Promise.reject(error);
  },
);

export { ACCESS_TOKEN_KEY };
export default api;
