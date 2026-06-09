import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MenuButtons } from '../../../../componentes/MenuButtons';

export default function MenuPassageiros() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Azul Moove padrão para unidade visual
  const AZUL_MOOVE = "#0056b3";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.titulo}>Gestão de Passageiros</Text>
          <Text style={styles.subtitulo}>Controle de rotas e embarques</Text>
          <View style={styles.linhaDestaque} />
        </View>

        <View style={styles.grid}>
          <MenuButtons 
            title="Listar Todos" 
            icon="account-group" 
            color={AZUL_MOOVE} 
            onPress={() => navigation.navigate('ListarPassageiros')} 
          />

          <MenuButtons 
            title="Novo Passageiro" 
            icon="account-plus" 
            color={AZUL_MOOVE} 
            onPress={() => navigation.navigate('CadastrarPassageiro')} 
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' // Fundo Branco
  },
  scrollContent: { 
    padding: 20 
  },
  header: { 
    marginBottom: 35, 
    marginTop: 10 
  },
  titulo: { 
    color: '#1a1a1a', // Texto Grafite
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