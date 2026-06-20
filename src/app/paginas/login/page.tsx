import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../@types/auth/AuthContextData';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const DOURADO = "#D4AF37";

  async function handleLogin() {
    if (!email || !senha) {
      return Alert.alert("Campos obrigatórios", "Por favor, preencha o e-mail e a senha.");
    }

    setCarregando(true);
    try {
      const urLCompleta = `${process.env.EXPO_PUBLIC_IP_ONE}/administrador/login`;
      // Substitua pelo IP da sua máquina se testar em dispositivo físico
      const resposta = await fetch(urLCompleta, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.message || 'Erro ao realizar login.');
      }

      Alert.alert("Sucesso", "Login realizado com sucesso!");
      login(dados.token); // Salva o token globalmente e redireciona para a Home automaticamente
    } catch (error: any) {
      Alert.alert("Falha no login", error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={styles.cardHeader}>
        <Text style={styles.titulo}>Painel Link</Text>
        <Text style={styles.subtitulo}>Faça login para gerenciar o sistema</Text>
        <View style={[styles.linha, { backgroundColor: DOURADO }]} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail do Administrador</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: admin@email.com" 
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Sua senha secreta" 
          placeholderTextColor="#666"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={[styles.botao, { backgroundColor: DOURADO }]} onPress={handleLogin} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#111" /> : <Text style={styles.botaoTexto}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center', paddingHorizontal: 25 },
  cardHeader: { marginBottom: 40 },
  titulo: { color: '#FFF', fontSize: 36, fontWeight: '700' },
  subtitulo: { color: '#999', fontSize: 14, marginTop: 4 },
  linha: { height: 4, width: 60, marginTop: 15, borderRadius: 10 },
  form: { backgroundColor: '#1c1c1c', padding: 20, borderRadius: 12 },
  label: { color: '#CCC', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#2a2a2a', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16 },
  botao: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  botaoTexto: { color: '#111', fontSize: 16, fontWeight: '700' }
});