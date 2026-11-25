import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import instancia from '../../../../service/api';
import IImageFile from '../../../../@types/interfaces/IImageFile';

export default function CadastroEmpresa() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [imagem, setImagem] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const navigation = useNavigation();

  const AZUL_MOOVE = "#0056b3";

  const formatarCNPJ = (text: string) => {
    const limpo = text.replace(/\D/g, '');
    return limpo
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const selecionarImagem = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImagem(result.assets[0]);
      }
  };


  const salvarEmpresa = async () => {
    if (!nome || !cnpj) {
      Alert.alert("Atenção", "Preencha o nome e o CNPJ!");
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cnpj', cnpj.replace(/\D/g, ''));

    if (imagem) {
      const arquivo: IImageFile = {
        uri: imagem.uri,
        name: imagem.fileName ?? `logo_${Date.now()}.jpg`,
        type: imagem.mimeType ?? 'image/jpeg',
      };
      formData.append('logo', arquivo as unknown as Blob);
    }

    try {
      await instancia.post('/empresa', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert("Sucesso", "Empresa cadastrada com sucesso!");
      navigation.goBack();
    } catch (error: unknown) {
      let mensagemErro = "Erro ao salvar empresa.";
      if (axios.isAxiosError(error)) {
        const servidorData = error.response?.data;
        if (servidorData) {
          mensagemErro = servidorData.message || servidorData.mensagem || (typeof servidorData === 'string' ? servidorData : mensagemErro);
        }
      }
      Alert.alert("Erro", mensagemErro);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.titulo}>Nova Empresa</Text>
        <Text style={styles.subtitulo}>Cadastre os dados da empresa parceira</Text>
        <View style={styles.linhaDestaque} />
      </View>

      <Text style={styles.label}>Nome da Empresa</Text>
      <TextInput 
        style={styles.input} 
        value={nome} 
        onChangeText={setNome} 
        placeholder="Ex: Viação Estrela" 
        placeholderTextColor="#999" 
      />

      <Text style={styles.label}>CNPJ</Text>
      <TextInput 
        style={styles.input} 
        value={cnpj} 
        onChangeText={(t) => setCnpj(formatarCNPJ(t))} 
        keyboardType="numeric" 
        maxLength={18} 
        placeholder="00.000.000/0000-00" 
        placeholderTextColor="#999" 
      />

      <Text style={styles.label}>Logo da Empresa</Text>
      <TouchableOpacity style={styles.botaoLogo} onPress={selecionarImagem}>
        {imagem ? (
          <Image source={{ uri: imagem.uri }} style={styles.previewLogo} />
        ) : (
          <View style={styles.placeholderContainer}>
             <Text style={styles.botaoTextoLogo}>Selecionar Logo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, { backgroundColor: AZUL_MOOVE }]} onPress={salvarEmpresa}>
        <Text style={styles.botaoTexto}>CADASTRAR EMPRESA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 25 },
  header: { marginBottom: 35, marginTop: 10 },
  titulo: { color: '#1a1a1a', fontSize: 28, fontWeight: '800' },
  subtitulo: { color: '#666', fontSize: 14, marginTop: 4 },
  linhaDestaque: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 12, borderRadius: 2 },
  label: { color: '#999', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#f8f9fa', color: '#1a1a1a', padding: 16, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  botaoLogo: { backgroundColor: '#f8f9fa', height: 160, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', overflow: 'hidden' },
  botaoTextoLogo: { color: '#999', fontWeight: '600' },
  placeholderContainer: { alignItems: 'center' },
  previewLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
  botao: { padding: 18, borderRadius: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});