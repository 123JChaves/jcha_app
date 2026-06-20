import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  logado: boolean;
  token: string | null;
  carregando: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // 1. Carrega o token salvo ao abrir o aplicativo para manter o usuário logado
  useEffect(() => {
    async function carregarTokenSalvo() {
      try {
        const tokenSalvo = await AsyncStorage.getItem('token'); // Usa a mesma chave do interceptor
        if (tokenSalvo) {
          setToken(tokenSalvo);
        }
      } catch (error) {
        console.log("Erro ao recuperar token inicial:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarTokenSalvo();
  }, []);

  // 2. Função de Login: Salva no estado e fisicamente no disco para o interceptor ler
  const login = async (tokenRecebido: string) => {
    try {
      setToken(tokenRecebido);
      await AsyncStorage.setItem('token', tokenRecebido); // Grava com a chave 'token'
    } catch (error) {
      console.log("Erro ao salvar token no login:", error);
    }
  };

  // 3. Função de Logout: Limpa tudo
  const logout = async () => {
    try {
      setToken(null);
      await AsyncStorage.removeItem('token'); // Remove a chave 'token'
    } catch (error) {
      console.log("Erro ao remover token no logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ logado: !!token, token, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}