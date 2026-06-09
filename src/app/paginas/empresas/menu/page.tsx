import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MenuButtons } from '../../../../componentes/MenuButtons';

export default function MenuEmpresas() {
  const navigation = useNavigation<any>();
  
  // Azul Moove padrão para unidade visual
  const AZUL_MOOVE = "#0056b3";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloHeader}>Gestão de Empresas</Text>
        <Text style={styles.subtitulo}>Controle de parceiros e convênios</Text>
        <View style={styles.linhaDestaque} />
      </View>

      <View style={styles.grid}>
        {/* BOTÃO PARA LISTAR */}
        <MenuButtons 
          title="Listar Empresas" 
          icon="office-building" 
          color={AZUL_MOOVE} 
          onPress={() => navigation.navigate('ListarEmpresas')} 
        />

        {/* BOTÃO PARA CADASTRAR */}
        <MenuButtons 
          title="Cadastrar Nova" 
          icon="plus-box" 
          color={AZUL_MOOVE} 
          onPress={() => navigation.navigate('CadastroEmpresa')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', // Fundo Branco
    padding: 20 
  },
  header: {
    marginBottom: 35,
    marginTop: 10
  },
  tituloHeader: { 
    color: '#1a1a1a', 
    fontSize: 26, 
    fontWeight: '800' 
  },
  subtitulo: { 
    color: '#666', 
    fontSize: 14, 
    marginTop: 4 
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