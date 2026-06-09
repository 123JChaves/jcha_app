import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import instancia from '../../../../service/api';
import IRotaCompleta from '../../../../@types/interfaces/IRotaCompleta';

export default function ListarRotas({ tipo }: { tipo: 'ROTA_TARDE' | 'ROTA_MADRUGADA' }) {
  const [rotas, setRotas] = useState<IRotaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const AZUL_MOOVE = "#0056b3";

  // Carrega as rotas que servirão de material base para a ListaRota
  const carregarRotas = async () => {
    try {
      // O backend agora retorna apenas as rotas do turno selecionado
      const res = await instancia.get<IRotaCompleta[]>(`/rotas/turno/${tipo}`);
      setRotas(res.data);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar os modelos de rota.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) carregarRotas();
  }, [isFocused]);

  const handleExcluirRota = (id: number, nome: string) => {
    Alert.alert(
      "Excluir Modelo",
      `Deseja remover a rota ${nome}? Isso afetará as futuras gerações de escala.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              await instancia.delete(`/rota/${id}`);
              carregarRotas();
              Alert.alert("Sucesso", "Modelo removido.");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          } 
        }
      ]
    );
  };

  const retornarEmoji = (index: number) => {
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    return emojis[index] || `${index + 1}º`;
  };

  const renderRota = ({ item }: { item: IRotaCompleta }) => (
    <View style={styles.cardRota}>
      <View style={styles.headerRota}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="bus-side" size={20} color={AZUL_MOOVE} />
          <Text style={styles.tituloRota} numberOfLines={1}>
            {/* Exibe o nome da primeira empresa vinculada ou 'Sem Empresa' */}
            {item.empresas && item.empresas.length > 0 ? item.empresas[0].nome : "Sem Empresa"} - {item.ordem}
          </Text>
          <TouchableOpacity 
            onPress={() => handleExcluirRota(item.id, item.nome)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <Text style={styles.areaTxt}>📍 {item.nome}</Text>
        <Text style={styles.horarioTxt}>🕒 {item.horario} (Chegada)</Text>
      </View>

      <View style={styles.linhaDivisora} />

      {/* Exibição dos passageiros do modelo */}
      {item.passageiros && item.passageiros.map((p, index) => (
        <View key={p.id} style={styles.itemPassageiro}>
          <Text style={styles.emoji}>{retornarEmoji(index)}</Text>
          <View style={styles.infoPassageiro}>
            <Text style={styles.nomePassageiro}>{p.nome}</Text>
            <Text style={styles.enderecoPassageiro}>
              {p.endereco?.nome}, {p.endereco?.numero}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.btnDetalhes} 
        activeOpacity={0.6}
        onPress={() => {
            if (item.id) {
                navigation.navigate('EditarRota', { id: item.id });
            }
        }} 
      >
        <Text style={styles.btnDetalhesTexto}>AJUSTAR MODELO / ORDEM</Text>
        <MaterialCommunityIcons name="pencil-outline" size={18} color={AZUL_MOOVE} />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={styles.centro}><ActivityIndicator color={AZUL_MOOVE} size="large" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerInfo}>
         <Text style={styles.tituloPagina}>
            {tipo === 'ROTA_TARDE' ? 'Modelos Turno Tarde' : 'Modelos Turno Madrugada'}
         </Text>
         <Text style={styles.subtituloPagina}>Estas rotas compõem o gabarito oficial.</Text>
      </View>
      
      <FlatList 
        data={rotas} 
        keyExtractor={item => String(item.id)} 
        renderItem={renderRota} 
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum modelo de rota cadastrado.</Text>} 
        contentContainerStyle={{ padding: 20 }} 
        showsVerticalScrollIndicator={false} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tituloPagina: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  subtituloPagina: { fontSize: 13, color: '#666', marginTop: 2 },
  cardRota: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 20, padding: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  headerRota: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  tituloRota: { fontSize: 15, fontWeight: '900', color: '#0056b3', flex: 1, marginLeft: 8 },
  areaTxt: { fontSize: 14, fontWeight: '700', color: '#333', marginLeft: 28, marginBottom: 2 },
  horarioTxt: { fontSize: 12, color: '#666', marginLeft: 28 },
  linhaDivisora: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  itemPassageiro: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  emoji: { fontSize: 18, marginRight: 12 },
  infoPassageiro: { flex: 1 },
  nomePassageiro: { fontSize: 14, fontWeight: '700', color: '#333' },
  enderecoPassageiro: { fontSize: 12, color: '#888' },
  btnDetalhes: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  btnDetalhesTexto: { fontSize: 11, fontWeight: '800', color: '#999', letterSpacing: 0.5 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 40 }
});