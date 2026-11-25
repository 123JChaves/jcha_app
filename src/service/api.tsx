import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Se estiver no Android, usa a URL do Ngrok (IP_ONE). Se não, usa a rede direta (IP_TWO)
const baseURL = Platform.OS === 'android'
  ? (process.env.EXPO_PUBLIC_IP_ONE)
  : (process.env.EXPO_PUBLIC_IP_TWO);

console.log(`🚀 [Axios no Docker] Conectando na URL: ${baseURL}`);

const instancia = axios.create({ 
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // 💡 OBRIGATÓRIO: Impede o Ngrok de enviar HTML de aviso
  }
});

instancia.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(`📡 [API] Chamando rota: ${config.url}`);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Erro ao ler token no Interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instancia;