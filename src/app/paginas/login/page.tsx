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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [exibirSenha, setExibirSenha] = useState(false); // Estado para controlar a visibilidade da senha
  const [carregando, setCarregando] = useState(false);

  const DOURADO = "#D4AF37";

  async function handleLogin() {
    if (!email || !senha) {
      return Alert.alert("Campos obrigatórios", "Por favor, preencha o e-mail e a senha.");
    }

    setCarregando(true);
    try {
      const urlCompleta = `${process.env.EXPO_PUBLIC_IP_ONE}/administrador/login`;
      
      const resposta = await fetch(urlCompleta, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const textoPuro = await resposta.text();
      
      if (!resposta.ok) {
        try {
          const dadosErro = JSON.parse(textoPuro);
          throw new Error(dadosErro.message || 'Erro na autenticação.');
        } catch {
          throw new Error('Servidor retornou uma resposta inválida (HTML). Verifique o IP e as rotas.');
        }
      }

      const dados = JSON.parse(textoPuro);

      Alert.alert("Sucesso", "Login realizado com sucesso!");
      await login(dados.token); 
    } catch (error: any) {
      Alert.alert("Falha no login", error.message);
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
          {/* Container criado para alinhar o input da senha e o botão do olho lado a lado */}
          <View style={styles.inputSenhaContainer}>
            <TextInput 
              style={styles.inputSenha} 
              placeholder="Sua senha secreta" 
              placeholderTextColor="#666"
              secureTextEntry={!exibirSenha} // Inverte o boolean (se exibirSenha for true, secureTextEntry vira false)
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
  
  // Estilização nova para o container e o olho
  // Altere apenas estas 3 propriedades dentro do seu StyleSheet.create:
  inputSenhaContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#2a2a2a', 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative' // Permite o alinhamento correto do botão
  },
  inputSenha: { 
    flex: 1, 
    color: '#FFF', 
    padding: 15, 
    fontSize: 16,
    paddingRight: 50 // Dá espaço para o texto não ficar embaixo do olho
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