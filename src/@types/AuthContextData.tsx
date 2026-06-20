import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IAuthContextData {
  logado: boolean;
  token: string | null;
  carregando: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContextData = createContext<IAuthContextData>({} as IAuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // 1. Carrega o token salvo ao abrir o aplicativo para manter o usuário logado
  useEffect(() => {
    async function carregarTokenSalvo() {
      try {
        const tokenSalvo = await AsyncStorage.getItem('token'); // Mesma chave usada pelo interceptor
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

  // 2. Função de Login: Salva no estado do React e fisicamente no disco para o interceptor ler
  const login = async (tokenRecebido: string) => {
    try {
      setToken(tokenRecebido);
      await AsyncStorage.setItem('token', tokenRecebido); // Grava fisicamente no aparelho
    } catch (error) {
      console.log("Erro ao salvar token no login:", error);
    }
  };

  // 3. Função de Logout: Limpa o estado e remove a chave do disco
  const logout = async () => {
    try {
      setToken(null);
      await AsyncStorage.removeItem('token'); // Remove o token do aparelho
    } catch (error) {
      console.log("Erro ao remover token no logout:", error);
    }
  };

  return (
    <AuthContextData.Provider value={{ logado: !!token, token, carregando, login, logout }}>
      {children}
    </AuthContextData.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContextData);
}