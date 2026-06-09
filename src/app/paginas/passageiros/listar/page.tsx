import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import instancia from '../../../../service/api';
import IPassageiro from '../../../../@types/interfaces/IPassageiro';

export default function ListarPassageiros() {
  const [passageiros, setPassageiros] = useState<IPassageiro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const AZUL_MOOVE = "#0056b3";

  const buscarPassageiros = async () => {
    try {
      const response = await instancia.get<IPassageiro[]>('/passageiros');
      setPassageiros(response.data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os passageiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) buscarPassageiros();
  }, [isFocused]);

  const handleExcluir = (id: number, nome: string) => {
    Alert.alert(
      "Remover Passageiro",
      `Deseja realmente excluir ${nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              await instancia.delete(`/passageiro/${id}`);
              buscarPassageiros();
            } catch (error) {
              Alert.alert("Erro", "Falha ao remover.");
            }
          } 
        }
      ]
    );
  };

  const handleEditar = (item: IPassageiro) => {
    if (!item.id) {
      console.error("ERRO: Passageiro sem ID detectado:", item.nome);
      Alert.alert("Erro", "Este passageiro não possui um ID válido para edição.");
      return;
    }
    
    // Log para conferir se o botão está sendo clicado
    console.log("Navegando para edição do ID:", item.id);
    
    // VERIFIQUE O NOME DA ROTA: Se no seu StackNavigator estiver 'CadastroPassageiro', mude aqui.
    navigation.navigate('CadastrarPassageiro', { id: item.id });
  };

  const renderItem = ({ item }: { item: IPassageiro }) => (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.nome}>{item.nome}</Text>
        <View style={styles.rowInfo}>
          <MaterialCommunityIcons name="whatsapp" size={14} color="#666" />
          <Text style={styles.subInfo}>{item.telefoneWhatsApp}</Text>
        </View>
        <View style={styles.enderecoBox}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={AZUL_MOOVE} />
          <Text style={styles.enderecoTexto} numberOfLines={2}>
            {item.endereco?.nome}, {item.endereco?.numero} - {item.endereco?.bairro?.nome}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.ativo ? '#e6ffed' : '#fff1f0' }]}>
          <Text style={[styles.statusTexto, { color: item.ativo ? '#28a745' : '#cf1322' }]}>
            {item.ativo ? 'ATIVO' : 'INATIVO'}
          </Text>
        </View>
      </View>

      <View style={styles.acoes}>
        <TouchableOpacity 
          onPress={() => handleEditar(item)} 
          style={styles.btnEditar}
        >
          <MaterialCommunityIcons name="pencil-outline" size={20} color={AZUL_MOOVE} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => item.id && handleExcluir(item.id, item.nome)} 
          style={styles.btnExcluir} 
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerSection}>
        <Text style={styles.header}>Passageiros</Text>
        <View style={styles.linhaDestaque} />
      </View>

      {loading ? (
        <View style={styles.centro}><ActivityIndicator size="large" color={AZUL_MOOVE} /></View>
      ) : (
        <FlatList
          data={passageiros}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum passageiro cadastrado.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  headerSection: { marginTop: 20, marginBottom: 25 },
  header: { color: '#1a1a1a', fontSize: 28, fontWeight: '800' },
  linhaDestaque: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 10, borderRadius: 2 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  infoContainer: { flex: 1 },
  nome: { color: '#1a1a1a', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  subInfo: { color: '#666', fontSize: 13, marginLeft: 5 },
  enderecoBox: { flexDirection: 'row', marginTop: 4, paddingRight: 10 },
  enderecoTexto: { color: '#888', fontSize: 12, marginLeft: 4, flex: 1, lineHeight: 16 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 12 },
  statusTexto: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  acoes: { flexDirection: 'row' },
  btnEditar: { width: 40, height: 40, backgroundColor: '#f0f7ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  btnExcluir: { width: 40, height: 40, backgroundColor: '#fff5f5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#999', textAlign: 'center', marginTop: 50, fontSize: 16 }
});