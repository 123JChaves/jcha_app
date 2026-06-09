import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ListRenderItem, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import IMotorista from '../../../../@types/interfaces/iMotorista';
import instancia from '../../../../service/api';

export default function MotoristasScreen() {
  const [motoristas, setMotoristas] = useState<IMotorista[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const AZUL_MOOVE = "#0056b3";

  const buscarMotoristas = async () => {
    try {
      const response = await instancia.get<IMotorista[]>('/motoristas');
      setMotoristas(response.data);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar motoristas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) buscarMotoristas();
  }, [isFocused]);

  const alternarHabilitacaoRota = async (id: number, statusAtual: boolean) => {
    try {
      await instancia.put(`/motorista/${id}`, { podeFazerRota: !statusAtual });
      buscarMotoristas();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar a permissão de rota.");
    }
  };

  const confirmarExclusao = (id: number, nome: string) => {
    Alert.alert("Remover Motorista", `Deseja remover ${nome}?`, [
      { text: "Cancelar", style: 'cancel' },
      { 
        text: "Excluir", 
        onPress: async () => {
          try {
            const response = await instancia.delete(`/motorista/${id}`);
            Alert.alert("Sucesso", response.data.message);
            buscarMotoristas();
          } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao excluir.";
            Alert.alert("Erro", msg);
          }
        }, 
        style: 'destructive' 
      }
    ]);
  };
  const renderItem: ListRenderItem<IMotorista> = ({ item }) => {
    // Captura o estado booleano de rotas (Garante tratamento se vier nulo/undefined)
    const habilitadoRota = (item as any).podeFazerRota === true;

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <View style={styles.rowInfo}>
            <MaterialCommunityIcons name="whatsapp" size={14} color="#666" />
            <Text style={styles.telefone}>{item.telefoneWhatsApp}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            {/* Badge de Status Ativo Legado */}
            <View style={[styles.statusBadge, { backgroundColor: item.ativo ? '#e6ffed' : '#fff1f0', marginRight: 8 }]}>
              <Text style={[styles.statusTexto, { color: item.ativo ? '#28a745' : '#cf1322' }]}>
                {item.ativo ? 'ATIVO' : 'INATIVO'}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => alternarHabilitacaoRota(item.id, habilitadoRota)}
              style={[styles.statusBadge, { backgroundColor: habilitadoRota ? '#e6f7ff' : '#f5f5f5' }]}
            >
              <Text style={[styles.statusTexto, { color: habilitadoRota ? '#1890ff' : '#666' }]}>
                {habilitadoRota ? '🚐 ROTA LIBERADA' : '🚫 SÓ PLANTÃO'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.acoes}>
          <TouchableOpacity onPress={() => navigation.navigate('DetalhesMotorista', { id: item.id })} style={styles.btnEditar}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color={AZUL_MOOVE} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmarExclusao(item.id, item.nome)} style={styles.btnExcluir}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerSection}>
        <Text style={styles.header}>Motoristas</Text>
        <View style={styles.linhaDestaque} />
      </View>

      {loading ? (
        <View style={styles.centro}><ActivityIndicator size="large" color={AZUL_MOOVE} /></View>
      ) : (
        <FlatList
          data={motoristas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View><Text style={styles.vazio}>Nenhum motorista encontrado.</Text></View>}
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
  centro: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  nome: { color: '#1a1a1a', fontSize: 17, fontWeight: '700' },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  telefone: { color: '#666', fontSize: 14, marginLeft: 5 },
  statusBadge: { 
    alignSelf: 'flex-start',
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    borderWidth: 1,
    borderColor: 'transparent'
  },
  statusTexto: { fontSize: 10, fontWeight: '800' },
  acoes: { flexDirection: 'row' },
  btnEditar: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#f0f7ff', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8 
  },
  btnExcluir: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#fff5f5', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  vazio: { color: '#999', textAlign: 'center', marginTop: 50, fontSize: 15 }
});