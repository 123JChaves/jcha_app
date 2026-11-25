import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import instancia from '../../../../service/api';
import IEmpresa from '../../../../@types/interfaces/IEmpresa';

const BASE_URL_IMAGENS = process.env.EXPO_PUBLIC_URL_IMAGEM;

export default function ListarEmpresas() {
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigation = useNavigation<any>();

  const AZUL_MOOVE = "#0056b3";

  useFocusEffect(
    useCallback(() => {
      buscarEmpresas();
    }, [])
  );

  const buscarEmpresas = async () => {
    try {
      const response = await instancia.get('/empresas');
      
      if (response.data) {
        // Converte as chaves indexadas "0", "1", "2" em um Array puro e limpo
        const listaTratada = Object.values(response.data) as IEmpresa[];
        setEmpresas(listaTratada);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as empresas.");
    } finally {
      setCarregando(false);
    }
  };

  const renderEmpresa = ({ item }: { item: IEmpresa }) => {
    // Garante que não haja barras duplas na concatenação da URL gerada pelo seu .env
    const uriImagem = item.logo 
      ? `${BASE_URL_IMAGENS}/${item.logo}`.replace(/([^:]\/)\/+/g, "\$1") 
      : null;

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardAction} 
          onPress={() => navigation.navigate('VisualizarEmpresa', { id: item.id })}
        >
          <View style={styles.fotoContainer}>
            {uriImagem ? (
              <Image 
                source={{ uri: uriImagem }} 
                style={styles.logo} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.letraPlaceholder}>
                  {item.nome ? item.nome.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
            <View style={styles.rowCnpj}>
              <MaterialCommunityIcons name="file-document-outline" size={14} color="#999" />
              <Text style={styles.cnpj}>{item.cnpj}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.botaoEditar} 
          onPress={() => navigation.navigate('EditarEmpresa', { id: item.id })}
        >
          <MaterialCommunityIcons name="pencil-outline" size={22} color={AZUL_MOOVE} />
        </TouchableOpacity>
      </View>
    );
  };

  if (carregando) {
    return (
      <View style={styles.containerCentro}>
        <ActivityIndicator size="large" color={AZUL_MOOVE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerSection}>
        <Text style={styles.titulo}>Empresas Parceiras</Text>
        <View style={styles.linhaDestaque} />
      </View>

      <FlatList
        data={empresas}
        // 🛠️ CHAVE INFALÍVEL: Evita que o React Native oculte o item por conta do ID 4 pulado
        keyExtractor={(item, index) => `empresa_${item?.id || index}_${index}`}
        renderItem={renderEmpresa}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma empresa encontrada.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  containerCentro: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  headerSection: { marginTop: 20, marginBottom: 25 },
  titulo: { color: '#1a1a1a', fontSize: 28, fontWeight: '800' },
  linhaDestaque: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 10, borderRadius: 2 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardAction: { flex: 1, flexDirection: 'row', padding: 18, alignItems: 'center' },
  fotoContainer: { width: 54, height: 54, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#eee' },
  logo: { width: '100%', height: '100%' },
  logoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  letraPlaceholder: { color: '#0056b3', fontSize: 24, fontWeight: 'bold' },
  info: { marginLeft: 15, flex: 1 },
  nome: { color: '#1a1a1a', fontSize: 17, fontWeight: '700' },
  rowCnpj: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cnpj: { color: '#666', fontSize: 13, marginLeft: 5 },
  botaoEditar: { paddingHorizontal: 15, height: '100%', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#f0f0f0' },
  vazio: { color: '#999', textAlign: 'center', marginTop: 50, fontSize: 16 }
});