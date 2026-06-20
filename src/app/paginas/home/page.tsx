import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MenuButtons } from '../../../componentes/MenuButtons';
import { useAuth } from '../../../@types/auth/AuthContextData';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { logout } = useAuth(); // Captura a função de logout para limpar a sessão
  
  const DOURADO = "#D4AF37"; 

  // Função para gerenciar a confirmação e execução do logout
  const executarLogout = () => {
    Alert.alert(
      "Sair", 
      "Deseja encerrar a sessão?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: () => logout() // Dispara a limpeza do token JWT
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 
         StatusBar Transparente: Isso remove a tarja branca 
         e faz o preto do header subir até o topo total.
      */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* O paddingTop aqui agora usa o insets.top para dar espaço aos ícones do sistema, mas mantendo o fundo preto atrás */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.titulo}>Painel Link</Text>
              <Text style={styles.subtitulo}>Gestão de Transporte e Logística</Text>
            </View>
            <TouchableOpacity style={styles.logout} onPress={executarLogout}>
              <MaterialCommunityIcons name="logout" size={24} color={DOURADO} />
            </TouchableOpacity>
          </View>
          <View style={[styles.linha, { backgroundColor: DOURADO }]} />
        </View>

        <View style={styles.grid}>
          <MenuButtons title="Admin" icon="shield-account" onPress={() => navigation.navigate('MenuAdministradores')} />
          <MenuButtons title="Empresas" icon="office-building" onPress={() => navigation.navigate('MenuEmpresas')} />
          <MenuButtons title="Motoristas" icon="steering" onPress={() => navigation.navigate('MenuMotoristas')} />
          <MenuButtons title="Passageiros" icon="account-group" onPress={() => navigation.navigate('MenuPassageiros')} />
          <MenuButtons title="Plantões" icon="calendar-clock" onPress={() => navigation.navigate('MenuPlantoes')} />
          <MenuButtons title="Rotas" icon="map-marker-distance" onPress={() => navigation.navigate('MenuRotas')} />
          <MenuButtons title="WhatsApp" icon="whatsapp" onPress={() => navigation.navigate('ControleBot')} />
        </View>

        <Text style={styles.footer}>Sistema Moove v2.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    backgroundColor: '#111', 
    paddingHorizontal: 25, 
    paddingBottom: 35, 
    marginBottom: 30,
    width: '100%',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { color: '#FFF', fontSize: 32, fontWeight: '700', letterSpacing: 0.2 },
  subtitulo: { color: '#999', fontSize: 14, marginTop: 2 },
  linha: { height: 4, width: 45, marginTop: 15, borderRadius: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 25 },
  footer: { textAlign: 'center', color: '#CCC', fontSize: 10, marginTop: 40, textTransform: 'uppercase', letterSpacing: 1.5 },
  logout: { padding: 5 }
});