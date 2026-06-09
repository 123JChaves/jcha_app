import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import instancia from '../../../../service/api';
import { IAdministrador } from '../../../../@types/interfaces/IAdministrador';

export default function ListaAdministradores() {
  const [admins, setAdmins] = useState<IAdministrador[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const AZUL_MOOVE = "#0056b3";

  const carregarAdmins = async () => {
    try {
      setLoading(true);
      const res = await instancia.get<IAdministrador[]>('/administradores');
      
      // LOG DE DEBBUG: Mostra no terminal do Expo o formato real que o celular está recebendo
      console.log("[ADMIN DEBUG] JSON bruto recebido:", JSON.stringify(res.data));

      if (res.data && Array.isArray(res.data)) {
        setAdmins(res.data);
      } else if (res.data && (res.data as any).data && Array.isArray((res.data as any).data)) {
        // Fallback para caso o backend envie envelopado em um objeto .data
        setAdmins((res.data as any).data);
      } else {
        console.log("[ADMIN AVISO] Estrutura de dados recebida não é um array válido.");
      }
    } catch (err: any) {
      console.error("[ADMIN ERRO CRÍTICO]:", err.message);
      Alert.alert("Erro", "Não foi possível carregar os administradores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) carregarAdmins();
  }, [isFocused]);

  const handleExcluir = (id: number, nome: string) => {
    Alert.alert(
      "Remover Administrador",
      `Tem certeza que deseja excluir ${nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              await instancia.delete(`/administrador/${id}`);
              carregarAdmins();
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir.");
            }
          } 
        }
      ]
    );
  };
  const renderItem = ({ item }: { item: IAdministrador }) => {
    // BLINDAGEM DO FRONT: Evita que chaves de colunas nulas ou alteradas quebrem a string do layout
    const nomeAdmin = item.nome || (item as any).NOME || 'Sem Nome';
    const emailAdmin = item.email || (item as any).EMAIL || 'Sem E-mail';
    const cpfAdmin = item.cpf || (item as any).CPF || 'Não informado';

    return (
      <View style={styles.card}>
        <View style={styles.infoContainer}>
          <Text style={styles.nome}>{nomeAdmin}</Text>
          <View style={styles.row}>
             <MaterialCommunityIcons name="email-outline" size={14} color="#666" />
             <Text style={styles.subInfo}>{emailAdmin}</Text>
          </View>
          <View style={styles.row}>
             <MaterialCommunityIcons name="card-account-details-outline" size={14} color="#999" />
             <Text style={styles.cpf}>CPF: {cpfAdmin}</Text>
          </View>
        </View>

        <View style={styles.acoes}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('CadastrarAdministrador', { id: item.id })} 
            style={styles.botaoEditar}
          >
            <MaterialCommunityIcons name="pencil-outline" size={20} color={AZUL_MOOVE} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleExcluir(item.id, nomeAdmin)} 
            style={styles.botaoExcluir}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administradores</Text>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{admins ? admins.length : 0}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centro}><ActivityIndicator size="large" color={AZUL_MOOVE} /></View>
      ) : (
        <FlatList
          data={admins}
          // Garante fallback de index caso o ID venha malformado no JSON bruto
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum admin cadastrado.</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 25 
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  badge: { 
    backgroundColor: '#e9ecef', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12, 
    marginLeft: 12 
  },
  badgeText: { color: '#0056b3', fontWeight: '700', fontSize: 14 },
  centro: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  infoContainer: { flex: 1 },
  nome: { color: '#1a1a1a', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  subInfo: { color: '#666', fontSize: 14, marginLeft: 6 },
  cpf: { color: '#999', fontSize: 12, marginLeft: 6 },
  acoes: { flexDirection: 'row' },
  botaoEditar: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#f0f7ff', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8 
  },
  botaoExcluir: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#fff5f5', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  empty: { color: '#999', textAlign: 'center', marginTop: 50, fontSize: 16 }
});