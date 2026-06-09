import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import instancia from '../../../../service/api';

export default function VisualizarEmpresa() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { id } = (route.params as { id: number }) || {}; 
  
  const [dados, setDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  const AZUL_MOOVE = "#0056b3";
  const BASE_URL_IMAGENS = process.env.EXPO_PUBLIC_URL_IMAGEM;

  const buscarDadosCompletos = async () => {
    if (!id) return;
    try {
      const response = await instancia.get(`/empresa/completa/${id}`);
      setDados(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da empresa.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (isFocused) buscarDadosCompletos();
  }, [isFocused, id]);

  const handleExcluirFuncionario = (funcId: number, nome: string) => {
    Alert.alert(
      "Remover Vínculo",
      `Deseja realmente remover ${nome} desta empresa?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive", 
          onPress: async () => {
            try {
              await instancia.delete(`/passageiro/${funcId}`);
              buscarDadosCompletos();
            } catch (error) {
              Alert.alert("Erro", "Falha ao remover funcionário.");
            }
          } 
        }
      ]
    );
  };

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={AZUL_MOOVE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. CABEÇALHO DA EMPRESA */}
      <View style={styles.empresaHeader}>
        <View style={styles.fotoContainer}>
          {dados?.logo ? (
            <Image source={{ uri: `${BASE_URL_IMAGENS}/${dados.logo}` }} style={styles.logo} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="office-building" size={50} color="#ccc" />
          )}
        </View>
        <Text style={styles.empresaNome}>{dados?.nome || "Empresa não encontrada"}</Text>
        <Text style={styles.empresaCnpj}>{dados?.cnpj || "00.000.000/0000-00"}</Text>
        <View style={styles.linhaDestaque} />
      </View>

      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Funcionários Vinculados</Text>
        <View style={styles.linhaSubtitulo} />
      </View>

      {/* 2. LISTA DE FUNCIONÁRIOS */}
      <FlatList 
        data={dados?.passageiros || []} 
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.infoContainer}>
              <Text style={styles.nome}>{item.nome}</Text>
              <View style={styles.rowInfo}>
                <MaterialCommunityIcons name="whatsapp" size={14} color="#25D366" />
                <Text style={styles.subInfo}>{item.telefoneWhatsApp}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.ativo ? '#e6ffed' : '#fff1f0' }]}>
                <Text style={[styles.statusTexto, { color: item.ativo ? '#28a745' : '#cf1322' }]}>
                  {item.ativo ? 'ATIVO' : 'INATIVO'}
                </Text>
              </View>
            </View>

            <View style={styles.acoes}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('CadastrarPassageiro', { id: item.id })} 
                style={styles.btnEditar}
              >
                <MaterialCommunityIcons name="pencil-outline" size={20} color={AZUL_MOOVE} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleExcluirFuncionario(item.id, item.nome)} style={styles.btnExcluir} >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum funcionário cadastrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empresaHeader: { alignItems: 'center', marginTop: 20, marginBottom: 20, paddingHorizontal: 20 },
  fotoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  logo: { width: '100%', height: '100%' },
  empresaNome: { color: '#1a1a1a', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  empresaCnpj: { color: '#666', fontSize: 13, marginTop: 4 },
  linhaDestaque: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 15, borderRadius: 2 },
  sectionTitleContainer: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  sectionTitle: { color: '#0056b3', fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  linhaSubtitulo: { height: 3, width: 45, backgroundColor: '#0056b3', marginTop: 8, borderRadius: 2 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  infoContainer: { flex: 1 },
  nome: { color: '#1a1a1a', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  subInfo: { color: '#666', fontSize: 13, marginLeft: 5 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 8 },
  statusTexto: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  acoes: { flexDirection: 'row' },
  btnEditar: { width: 40, height: 40, backgroundColor: '#f0f7ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  btnExcluir: { width: 40, height: 40, backgroundColor: '#fff5f5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#999', textAlign: 'center', marginTop: 30, fontSize: 16 }
});