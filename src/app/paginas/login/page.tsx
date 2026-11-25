import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../@types/AuthContextData';
import instancia from '../../../service/api';
 

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [exibirSenha, setExibirSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const DOURADO = "#D4AF37";

  async function handleLogin() {
    if (!email || !senha) {
      return Alert.alert("Campos obrigatórios", "Por favor, preencha o e-mail e a senha.");
    }

    setCarregando(true);
    try {
      // 1. Mudança para o Axios: Ele já usa a URL base correta configurada para o celular
      const resposta = await instancia.post('/login', { email, senha });

      // 2. O Axios já faz o JSON.parse() automaticamente em res.data
      if (resposta.data && resposta.data.token) {
        Alert.alert("Sucesso", "Login realizado com sucesso!");
        
        // 3. Salva o token no Contexto de Autenticação e limpa os campos
        await login(resposta.data.token); 
      } else {
        throw new Error('O servidor não retornou um token válido.');
      }
    } catch (error: any) {
      // 4. Captura mensagens de erro amigáveis tratadas pelo Axios ou pelo backend
      const mensagemErro = error.response?.data?.erro || error.response?.data?.message || error.message;
      
      console.error("[LOGIN ERRO]:", mensagemErro);
      Alert.alert("Falha no login", "E-mail ou Senha inválidos!");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer, 
          { paddingTop: insets.top, paddingBottom: insets.bottom }
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
          <View style={styles.inputSenhaContainer}>
            <TextInput 
              style={styles.inputSenha} 
              placeholder="Sua senha secreta" 
              placeholderTextColor="#666"
              secureTextEntry={!exibirSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity 
              style={styles.iconeOlho} 
              onPress={() => setExibirSenha(!exibirSenha)}
            >
              <MaterialCommunityIcons 
                name={exibirSenha ? "eye-off" : "eye"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.botao, { backgroundColor: DOURADO }]} onPress={handleLogin} disabled={carregando}>
            {carregando ? <ActivityIndicator color="#111" /> : <Text style={styles.botaoTexto}>Entrar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 25 },
  cardHeader: { marginBottom: 40 },
  titulo: { color: '#FFF', fontSize: 36, fontWeight: '700' },
  subtitulo: { color: '#999', fontSize: 14, marginTop: 4 },
  linha: { height: 4, width: 60, marginTop: 15, borderRadius: 10 },
  form: { backgroundColor: '#1c1c1c', padding: 20, borderRadius: 12 },
  label: { color: '#CCC', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#2a2a2a', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16 },
  inputSenhaContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#2a2a2a', 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative'
  },
  inputSenha: { 
    flex: 1, 
    color: '#FFF', 
    padding: 15, 
    fontSize: 16,
    paddingRight: 50
  },
  iconeOlho: { 
    position: 'absolute',
    right: 0,
    height: '100%',
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  botao: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  botaoTexto: { color: '#111', fontSize: 16, fontWeight: '700' }
});