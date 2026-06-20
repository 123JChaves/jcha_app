import React from 'react';
import { AuthProvider, useAuth } from './src/@types/auth/AuthContextData';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Telas Internas
import HomeScreen from './src/app/paginas/home/page';
import MenuMotoristas from './src/app/paginas/motoristas/menu/page';
import ListarMotoristas from './src/app/paginas/motoristas/listar/page';
import CadastrarMotorista from './src/app/paginas/motoristas/cadastrar/page';
import DetalhesMotorista from './src/app/paginas/motoristas/[id]/page';
import MenuAdministradores from './src/app/paginas/administradores/menu/page';
import ListaAdministradores from './src/app/paginas/administradores/lista/page';
import CadastrarAdministrador from './src/app/paginas/administradores/cadastro/page';
import MenuPassageiros from './src/app/paginas/passageiros/menu/page';
import ListarPassageiros from './src/app/paginas/passageiros/listar/page';
import CadastrarPassageiro from './src/app/paginas/passageiros/cadastrar/page';
import MenuEmpresas from './src/app/paginas/empresas/menu/page';
import CadastroEmpresa from './src/app/paginas/empresas/cadastro/page';
import ListarEmpresas from './src/app/paginas/empresas/lista/page';
import VisualizarEmpresa from './src/app/paginas/empresas/[id]/page';
import EditarEmpresa from './src/app/paginas/empresas/[id]/edicao/page';

import MenuPlantoes from './src/app/paginas/plantoes/menu/page';
import DetalhePlantao from './src/app/paginas/plantoes/[id]/page';

import MenuRotas from './src/app/paginas/rotas/menu/page';
import CadastrarRotas from './src/app/paginas/rotas/cadastrar/page';
import ListarRotasTarde from './src/app/paginas/rotas/menu/rotas_tarde/page';
import ListarRotasMadrugada from './src/app/paginas/rotas/menu/rotas_madrugada/page';
import EditarRota from './src/app/paginas/rotas/[id]/editar/page';
import ControleBot from './src/bot/page';
import LoginScreen from './src/app/paginas/login/page';

const Stack = createNativeStackNavigator();

// Sub-componente responsável por renderizar as telas dependendo do estado de login
function NavegacaoApp() {
  const { logado } = useAuth();

  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#000' }
      }}
    >
      {!logado ? (
        // Fluxo de Autenticação: Apenas a tela de login fica disponível
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        // Fluxo Protegido: Fica disponível apenas após a validação do token JWT
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

          <Stack.Group>
            <Stack.Screen name="MenuMotoristas" component={MenuMotoristas} options={{ title: 'Gestão de Motoristas' }} />
            <Stack.Screen name="ListarMotoristas" component={ListarMotoristas} options={{ title: 'Lista de Motoristas' }} />
            <Stack.Screen name="CadastrarMotorista" component={CadastrarMotorista} options={{ title: 'Novo Motorista' }} />
            <Stack.Screen name="DetalhesMotorista" component={DetalhesMotorista} options={{ title: 'Editar Motorista' }} />
          </Stack.Group>

          <Stack.Group>
            <Stack.Screen name="MenuAdministradores" component={MenuAdministradores} options={{ title: 'Gestão Administrativa' }} />
            <Stack.Screen name="ListaAdministradores" component={ListaAdministradores} options={{ title: 'Administradores' }} />
            <Stack.Screen name="CadastrarAdministrador" component={CadastrarAdministrador} options={{ title: 'Novo Administrator' }} />
          </Stack.Group>

          <Stack.Group>
            <Stack.Screen name="MenuPassageiros" component={MenuPassageiros} options={{ title: 'Gestão de Passageiros' }} />
            <Stack.Screen name="ListarPassageiros" component={ListarPassageiros} options={{ title: 'Lista de Passageiros' }} />
            <Stack.Screen name="CadastrarPassageiro" component={CadastrarPassageiro} options={{ title: 'Novo Passageiro' }} />
          </Stack.Group>

          <Stack.Group>
            <Stack.Screen name="MenuEmpresas" component={MenuEmpresas} options={{ title: 'Gestão de Empresas' }} />
            <Stack.Screen name="CadastroEmpresa" component={CadastroEmpresa} options={{ title: 'Cadastrar Empresa' }} />
            <Stack.Screen name="ListarEmpresas" component={ListarEmpresas} options={{ title: 'Lista de Empresas' }} />
            <Stack.Screen name="VisualizarEmpresa" component={VisualizarEmpresa} options={{ title: 'Detalhes da Empresa' }} />
            <Stack.Screen name="EditarEmpresa" component={EditarEmpresa} options={{ title: 'Editar Empresa' }} />
          </Stack.Group>

          <Stack.Group>
            <Stack.Screen name="MenuPlantoes" component={MenuPlantoes} options={{ title: 'Escalas e Plantões' }} />
            <Stack.Screen name="DetalhePlantao" component={DetalhePlantao} options={{ title: 'Fila de Joinhas do Dia' }} />
          </Stack.Group>

          <Stack.Group>
            <Stack.Screen name="MenuRotas" component={MenuRotas} options={{ title: 'Gestão de Rotas' }} />
            <Stack.Screen name="CadastrarRotas" component={CadastrarRotas} options={{ title: 'Montar Nova Rota' }} />
            <Stack.Screen name="ListarRotasTarde" component={ListarRotasTarde} options={{ title: 'Rotas Tarde' }} />
            <Stack.Screen name="ListarRotasMadrugada" component={ListarRotasMadrugada} options={{ title: 'Rotas Madrugada' }} />
            <Stack.Screen name="EditarRota" component={EditarRota} options={{ title: 'Editar Rota' }} />
          </Stack.Group>

          <Stack.Group>
            <Stack.Screen name="ControleBot" component={ControleBot} options={{ title: 'Controle do WhatsApp' }} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <NavegacaoApp />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}