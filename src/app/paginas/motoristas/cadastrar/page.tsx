import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import instancia from '../../../../service/api';

export default function CadastroMotorista() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const navigation = useNavigation();

  const AZUL_MOOVE = "#0056b3";

  const salvarMotorista = async () => {
    if (!nome || !telefone) {
      Alert.alert("Atenção", "Preencha todos os campos para continuar.");
      return;
    }

    try {
      await instancia.post('/motorista', { 
        nome, 
        telefoneWhatsApp: telefone, 
        ativo: true 
      });
      Alert.alert("Sucesso", "Motorista cadastrado com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o motorista. Verifique a conexão.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.titulo}>Novo Motorista</Text>
        <Text style={styles.subtitulo}>Preencha os dados básicos de acesso</Text>
        <View style={styles.linhaDestaque} />
      </View>

      <Text style={styles.label}>Nome Completo</Text>
      <TextInput 
        style={styles.input} 
        value={nome} 
        onChangeText={setNome} 
        placeholder="Ex: João Silva" 
        placeholderTextColor="#999" 
      />

      <Text style={styles.label}>WhatsApp</Text>
      <TextInput 
        style={styles.input} 
        value={telefone} 
        onChangeText={setTelefone} 
        keyboardType="phone-pad" 
        placeholder="Ex: 44999999999" 
        placeholderTextColor="#999" 
      />

      <TouchableOpacity style={styles.botao} onPress={salvarMotorista}>
        <Text style={styles.botaoTexto}>CADASTRAR MOTORISTA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollContent: {
    padding: 25,
  },
  header: {
    marginBottom: 35,
    marginTop: 10
  },
  titulo: {
    color: '#1a1a1a',
    fontSize: 28,
    fontWeight: '800'
  },
  subtitulo: {
    color: '#666',
    fontSize: 14,
    marginTop: 4
  },
  linhaDestaque: {
    height: 4,
    width: 35,
    backgroundColor: '#0056b3',
    marginTop: 12,
    borderRadius: 2
  },
  label: { 
    color: '#999', 
    marginBottom: 8, 
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
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
  botaoTexto: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
    letterSpacing: 1
  }
});