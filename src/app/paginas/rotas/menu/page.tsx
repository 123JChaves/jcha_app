import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MenuButtons } from '../../../../componentes/MenuButtons';

export default function MenuRotas() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const AZUL_MOOVE = "#0056b3";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.titulo}>Gestão de Rotas</Text>
          <Text style={styles.subtitulo}>Selecione o turno de operação para gerenciar</Text>
          <View style={styles.linhaDestaque} />
        </View>

        <View style={styles.grid}>
          {/* AGRUPAMENTO: TURNO DA TARDE */}
          <MenuButtons 
            title="Rotas Tarde" 
            icon="weather-sunny" 
            color={AZUL_MOOVE} 
            width="48%"
            onPress={() => navigation.navigate('ListarRotasTarde')} 
          />

          {/* AGRUPAMENTO: TURNO DA MADRUGADA */}
          <MenuButtons 
            title="Rotas Noite" 
            icon="weather-night" 
            color={AZUL_MOOVE} 
            width="48%"
            onPress={() => navigation.navigate('ListarRotasMadrugada')} 
          />

          {/* ACESSO AO CADASTRO */}
          <MenuButtons 
            title="Cadastrar Nova Rota" 
            icon="map-marker-plus" 
            color={AZUL_MOOVE} 
            onPress={() => navigation.navigate('CadastrarRotas')} 
            width="100%" 
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollContent: { 
    padding: 20 
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
    marginTop: 4, 
    fontWeight: '500' 
  },
  linhaDestaque: { 
    height: 4, 
    width: 35, 
    backgroundColor: '#0056b3', 
    marginTop: 12, 
    borderRadius: 2 
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
});