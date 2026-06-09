import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MenuButtons } from '../../../../componentes/MenuButtons';

export default function MenuAdministradores() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  
  // Azul Moove padrão para unidade visual
  const AZUL_MOOVE = "#0056b3";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.titulo}>Gestão Administrativa</Text>
          <Text style={styles.subtitulo}>Controle de acesso e usuários</Text>
          <View style={styles.linhaDestaque} />
        </View>

        <View style={styles.grid}>
          <MenuButtons 
            title="Listar Admins" 
            icon="shield-account" 
            color={AZUL_MOOVE} 
            onPress={() => navigation.navigate('ListaAdministradores')} 
          />

          <MenuButtons 
            title="Novo Admin" 
            icon="account-plus" 
            color={AZUL_MOOVE} 
            onPress={() => navigation.navigate('CadastrarAdministrador')} 
          />

          <MenuButtons 
            title="Logs de Sistema" 
            icon="clipboard-text-clock" 
            color={AZUL_MOOVE} 
            onPress={() => console.log('Ver Logs')} 
          />

          <MenuButtons 
            title="Permissões" 
            icon="lock-check" 
            color={AZUL_MOOVE} 
            onPress={() => console.log('Permissões')} 
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