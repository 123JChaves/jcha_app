import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import instancia from '../../../../service/api';
import { IAdministrador } from '../../../../@types/interfaces/IAdministrador';

interface IFormAdmin extends Partial<IAdministrador> {
  senha?: string;
  telefoneWhatsApp?: string;
}

export default function CadastrarAdministrador() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const id = route.params?.id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<IFormAdmin>({
    nome: '', email: '', cpf: '', senha: '', telefoneWhatsApp: ''
  });

  const AZUL_MOOVE = "#0056b3";

  useEffect(() => {
    if (id) {
      setLoading(true);
      instancia.get<IFormAdmin>(`/administrador/${id}`)
        .then(res => setForm(res.data))
        .catch((error) => {
          const msg = error.response?.data?.message || "Falha ao carregar dados.";
          Alert.alert("Erro", msg);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSalvar = async () => {
    if (!form.nome || !form.email || !form.cpf || (!id && !form.senha)) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios (*).");
      return;
    }

    setLoading(true);
    try {
      if (id) {
        const response = await instancia.put(`/administrador/${id}`, form);
        Alert.alert("Sucesso", response.data.message || "Dados atualizados!");
      } else {
        const response = await instancia.post('/administrador', form);
        Alert.alert("Sucesso", response.data.message || "Administrador cadastrado!");
      }
      navigation.goBack();
    } catch (error: any) {
      const mensagemServidor = error.response?.data?.message || "Erro ao salvar os dados.";
      Alert.alert("Falha no Registro", mensagemServidor);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={AZUL_MOOVE} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>{id ? "Editar Perfil" : "Novo Administrador"}</Text>
          <Text style={styles.subtitulo}>Controle de acessos do sistema Moove</Text>
          <View style={styles.linhaDestaque} />
        </View>

        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput 
          style={styles.input} 
          value={form.nome} 
          onChangeText={(v) => setForm({...form, nome: v})} 
          placeholder="Ex: Juliano Admin" 
          placeholderTextColor="#999" 
        />

        <Text style={styles.label}>E-mail *</Text>
        <TextInput 
          style={styles.input} 
          value={form.email} 
          onChangeText={(v) => setForm({...form, email: v})} 
          keyboardType="email-address" 
          autoCapitalize="none" 
          placeholder="exemplo@moove.com" 
          placeholderTextColor="#999" 
        />

        <Text style={styles.label}>CPF *</Text>
        <TextInput 
          style={styles.input} 
          value={form.cpf} 
          onChangeText={(v) => setForm({...form, cpf: v})} 
          keyboardType="numeric" 
          placeholder="000.000.000-00" 
          placeholderTextColor="#999" 
        />

        <Text style={styles.label}>WhatsApp (Opcional)</Text>
        <TextInput 
          style={styles.input} 
          value={form.telefoneWhatsApp} 
          onChangeText={(v) => setForm({...form, telefoneWhatsApp: v})} 
          keyboardType="phone-pad" 
          placeholder="44 99999-9999" 
          placeholderTextColor="#999" 
        />

        {!id && (
          <>
            <Text style={styles.label}>Senha de Acesso *</Text>
            <TextInput 
              style={styles.input} 
              value={form.senha} 
              onChangeText={(v) => setForm({...form, senha: v})} 
              secureTextEntry 
              placeholder="Mínimo 6 caracteres" 
              placeholderTextColor="#999" 
            />
          </>
        )}

        <TouchableOpacity 
          style={[styles.botao, loading && { opacity: 0.7 }]} 
          onPress={handleSalvar} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>{id ? "SALVAR ALTERAÇÕES" : "CADASTRAR ADMINISTRADOR"}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 25, paddingBottom: 50 },
  centered: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 35, marginTop: 10 },
  titulo: { color: '#1a1a1a', fontSize: 28, fontWeight: '800' },
  subtitulo: { color: '#666', fontSize: 14, marginTop: 4 },
  linhaDestaque: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 12, borderRadius: 2 },
  label: { color: '#999', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { 
    backgroundColor: '#f8f9fa', 
    color: '#1a1a1a', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 25, 
    borderWidth: 1, 
    borderColor: '#eee',
    fontSize: 16
  },
  botao: { 
    backgroundColor: '#0056b3', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});