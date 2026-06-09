import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, ScrollView, StatusBar, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import IMotorista from '../../../../@types/interfaces/iMotorista';
import instancia from '../../../../service/api';

export default function DetalhesMotorista() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [ativo, setAtivo] = useState(true);

  const AZUL_MOOVE = "#0056b3";

  useEffect(() => {
    instancia.get<IMotorista>(`/motorista/${id}`)
      .then(res => {
        setNome(res.data.nome);
        setTelefone(res.data.telefoneWhatsApp);
        setAtivo(res.data.ativo);
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar os dados."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSalvarEdicao = async () => {
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    try {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      await instancia.put(`/motorista/${id}`, { 
        nome: nome.trim(), 
        telefoneWhatsApp: telefoneLimpo, 
        ativo 
      });
      Alert.alert("Sucesso", "Dados atualizados!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar motorista.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.titulo}>Editar Motorista</Text>
          <Text style={styles.subtitulo}>Gerencie as informações do cadastro #{id}</Text>
          <View style={styles.linhaDestaque} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput 
            style={styles.input} 
            value={nome} 
            onChangeText={setNome} 
            placeholder="Ex: João Silva"
            placeholderTextColor="#999" 
          />

          <Text style={styles.label}>WhatsApp *</Text>
          <TextInput 
            style={styles.input} 
            value={telefone} 
            onChangeText={setTelefone} 
            keyboardType="phone-pad" 
            placeholder="Ex: 44999998888"
            placeholderTextColor="#999" 
          />

          <Text style={styles.label}>Status do Motorista</Text>
          <TouchableOpacity 
            style={[styles.botaoStatus, { backgroundColor: ativo ? '#f0f9f4' : '#fff5f5', borderColor: ativo ? '#c3e6cb' : '#f5c6cb' }]} 
            onPress={() => setAtivo(!ativo)}
          >
            <Text style={{ color: ativo ? '#155724' : '#721c24', fontWeight: 'bold', fontSize: 13 }}>
              {ativo ? '● MOTORISTA ATIVO' : '○ MOTORISTA INATIVO'}
            </Text>
            <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>Toque para alterar o status</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.botaoSalvar, salvando && { opacity: 0.7 }]} 
            onPress={handleSalvarEdicao} 
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotao}>CONFIRMAR ALTERAÇÕES</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
            <Text style={styles.textoVoltar}>CANCELAR</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 25, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 35, marginTop: 10 },
  titulo: { color: '#1a1a1a', fontSize: 28, fontWeight: '800' },
  subtitulo: { color: '#666', fontSize: 14, marginTop: 4 },
  linhaDestaque: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 12, borderRadius: 2 },
  form: { width: '100%' },
  label: { color: '#999', fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#f8f9fa', color: '#1a1a1a', padding: 16, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  botaoStatus: { padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30, borderWidth: 1 },
  botaoSalvar: { backgroundColor: '#0056b3', padding: 18, borderRadius: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
  botaoVoltar: { padding: 20, alignItems: 'center' },
  textoVoltar: { color: '#999', fontWeight: '600', fontSize: 14 }
});