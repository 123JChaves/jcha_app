import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import instancia from '../../../../service/api';
import { EntidadeGeografica } from '../../../../@types/interfaces/IEntidadeGeografica';
import IEmpresa from '../../../../@types/interfaces/IEmpresa';
import IPassageiro from '../../../../@types/interfaces/IPassageiro';

type ParametrosRota = {
  Detalhes: { id?: number };
};

export default function CadastrarPassageiro() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParametrosRota, 'Detalhes'>>();
  const insets = useSafeAreaInsets();
  const idPassageiro = route.params?.id;

  const [estaSalvando, setEstaSalvando] = useState(false);
  const [estaCarregandoDados, setEstaCarregandoDados] = useState(false);
  const [listaEmpresas, setListaEmpresas] = useState<IEmpresa[]>([]);

  const [idEmpresaSelecionada, setIdEmpresaSelecionada] = useState("");
  const [nomePassageiro, setNomePassageiro] = useState("");
  const [telefoneWhatsApp, setTelefoneWhatsApp] = useState("");
  const [nomeRua, setNomeRua] = useState("");
  const [numeroResidencia, setNumeroResidencia] = useState("");
  const [nomeBairro, setNomeBairro] = useState("");
  const [nomeCidade, setNomeCidade] = useState("");
  const [nomeEstado, setNomeEstado] = useState("");
  const [nomePais, setNomePais] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [campoEmFoco, setCampoEmFoco] = useState<string | null>(null);
  const [sugestoesGeograficas, setSugestoesGeograficas] = useState<EntidadeGeografica[]>([]);
  const termoUltimaBusca = useRef("");
  const AZUL_MOOVE = "#0056b3";

  useEffect(() => {
    const carregarInformacoesIniciais = async () => {
      try {
        const respostaEmpresas = await instancia.get<IEmpresa[]>('/empresas');
        setListaEmpresas(respostaEmpresas.data);

        if (idPassageiro) {
          setEstaCarregandoDados(true);
          const respostaPassageiro = await instancia.get<IPassageiro>(`/passageiro/${idPassageiro}`);
          const dadosPassageiro = respostaPassageiro.data;

          setNomePassageiro(dadosPassageiro.nome);
          setTelefoneWhatsApp(dadosPassageiro.telefoneWhatsApp);
          setIdEmpresaSelecionada(String(dadosPassageiro.empresa?.id));
          setAtivo(dadosPassageiro.ativo || false);

          if (dadosPassageiro.endereco) {
            setNomeRua(dadosPassageiro.endereco.nome);
            setNumeroResidencia(String(dadosPassageiro.endereco.numero));
            const bairro = dadosPassageiro.endereco.bairro;
            setNomeBairro(bairro?.nome || "");
            setNomeCidade(bairro?.cidade?.nome || "");
            setNomeEstado(bairro?.cidade?.estado?.nome || "");
            setNomePais(bairro?.cidade?.estado?.pais?.nome || "");
          }
        }
      } catch (erro) {
        Alert.alert("Erro", "Falha ao sincronizar dados.");
      } finally {
        setEstaCarregandoDados(false);
      }
    };
    carregarInformacoesIniciais();
  }, [idPassageiro]);

  const buscarSugestoesGeograficas = async (textoDigitado: string, tipoCampo: string) => {
    if (tipoCampo === 'pais') setNomePais(textoDigitado);
    if (tipoCampo === 'estado') setNomeEstado(textoDigitado);
    if (tipoCampo === 'cidade') setNomeCidade(textoDigitado);
    if (tipoCampo === 'bairro') setNomeBairro(textoDigitado);

    if (textoDigitado.length > 2 && textoDigitado !== termoUltimaBusca.current) {
      termoUltimaBusca.current = textoDigitado;
      try {
        const rotaSugerida = `/${tipoCampo === 'pais' ? 'paises' : tipoCampo + 's'}`;
        const resposta = await instancia.get<EntidadeGeografica[]>(rotaSugerida);
        const resultadosFiltrados = resposta.data.filter(item => 
          item.nome.toLowerCase().includes(textoDigitado.toLowerCase())
        );
        setSugestoesGeograficas(resultadosFiltrados);
        setCampoEmFoco(tipoCampo);
      } catch (erro) {
        setSugestoesGeograficas([]);
      }
    } else if (textoDigitado.length <= 2) {
      setSugestoesGeograficas([]);
      setCampoEmFoco(null);
    }
  };

  const selecionarSugestao = (nome: string, tipoCampo: string) => {
    if (tipoCampo === 'pais') setNomePais(nome);
    if (tipoCampo === 'estado') setNomeEstado(nome);
    if (tipoCampo === 'cidade') setNomeCidade(nome);
    if (tipoCampo === 'bairro') setNomeBairro(nome);
    
    setSugestoesGeograficas([]);
    setCampoEmFoco(null);
    termoUltimaBusca.current = nome;
  };

  const renderizarSugestoes = (tipoCampo: string) => {
    if (campoEmFoco === tipoCampo && sugestoesGeograficas.length > 0) {
      return (
        <View style={styles.containerListaAbsoluta}>
          {sugestoesGeograficas.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemSugestao} 
              onPress={() => selecionarSugestao(item.nome, tipoCampo)}
            >
              <Text style={styles.textoSugestao}>{item.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return null;
  };

  const processarSalvamento = async () => {
    if (!nomePassageiro || !telefoneWhatsApp || !idEmpresaSelecionada || !nomeRua || !numeroResidencia || !nomeBairro || !nomeCidade || !nomeEstado || !nomePais) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    setEstaSalvando(true);
    const objetoParaEnvio = {
      nome: nomePassageiro.trim(),
      telefoneWhatsApp: telefoneWhatsApp.replace(/\D/g, ''),
      ativo,
      empresa: { id: Number(idEmpresaSelecionada) },
      endereco: {
        nome: nomeRua.trim(),
        numero: Number(numeroResidencia),
        bairro: {
          nome: nomeBairro.trim(),
          cidade: {
            nome: nomeCidade.trim(),
            estado: {
              nome: nomeEstado.trim(),
              pais: { nome: nomePais.trim() }
            }
          }
        }
      }
    };

    try {
      if (idPassageiro) {
        await instancia.put(`/passageiro/${idPassageiro}`, objetoParaEnvio);
        Alert.alert("Sucesso", "Cadastro atualizado.");
      } else {
        await instancia.post("/passageiro", objetoParaEnvio);
        Alert.alert("Sucesso", "Cadastro realizado.");
      }
      navigation.goBack();
    } catch (erro) {
      Alert.alert("Erro", "O servidor rejeitou os dados.");
    } finally {
      setEstaSalvando(false);
    }
  };

  if (estaCarregandoDados) {
    return <View style={styles.containerCentralizado}><ActivityIndicator size="large" color={AZUL_MOOVE} /></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.tela}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.areaPrincipal, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.conteudoScroll} keyboardShouldPersistTaps="handled">
          
          <View style={styles.blocoCabecalho}>
            <Text style={styles.textoTitulo}>{idPassageiro ? "Editar Perfil" : "Novo Passageiro"}</Text>
            <View style={styles.detalheLinha} />
          </View>

          {idPassageiro && (
            <TouchableOpacity 
              style={[styles.botaoStatus, { backgroundColor: ativo ? '#f0f9f4' : '#fff5f5', borderColor: ativo ? '#c3e6cb' : '#f5c6cb' }]} 
              onPress={() => setAtivo(!ativo)}
            >
              <Text style={{ color: ativo ? '#155724' : '#721c24', fontWeight: 'bold' }}>{ativo ? 'ATIVO' : 'INATIVO'}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.rotuloCampo}>Empresa</Text>
          <View style={styles.containerPicker}>
            <Picker selectedValue={idEmpresaSelecionada} onValueChange={setIdEmpresaSelecionada}>
              <Picker.Item label="Selecione..." value="" color="#999" />
              {listaEmpresas.map(emp => <Picker.Item key={emp.id} label={emp.nome} value={String(emp.id)} />)}
            </Picker>
          </View>

          <TextInput style={styles.campoInput} placeholder="Nome" value={nomePassageiro} onChangeText={setNomePassageiro} />
          <TextInput style={styles.campoInput} placeholder="WhatsApp" value={telefoneWhatsApp} onChangeText={setTelefoneWhatsApp} keyboardType="phone-pad" />

          <View style={styles.divisorEspacador} />

          {/* CAMPOS COM SUGESTÕES */}
          <View style={{ zIndex: 5 }}>
            <TextInput style={styles.campoInput} value={nomePais} onChangeText={(t) => buscarSugestoesGeograficas(t, 'pais')} placeholder="País" />
            {renderizarSugestoes('pais')}
          </View>

          <View style={{ zIndex: 4 }}>
            <TextInput style={styles.campoInput} value={nomeEstado} onChangeText={(t) => buscarSugestoesGeograficas(t, 'estado')} placeholder="Estado" />
            {renderizarSugestoes('estado')}
          </View>

          <View style={{ zIndex: 3 }}>
            <TextInput style={styles.campoInput} value={nomeCidade} onChangeText={(t) => buscarSugestoesGeograficas(t, 'cidade')} placeholder="Cidade" />
            {renderizarSugestoes('cidade')}
          </View>

          <View style={{ zIndex: 2 }}>
            <TextInput style={styles.campoInput} value={nomeBairro} onChangeText={(t) => buscarSugestoesGeograficas(t, 'bairro')} placeholder="Bairro" />
            {renderizarSugestoes('bairro')}
          </View>

          <View style={styles.fileiraDupla}>
            <TextInput style={[styles.campoInput, { flex: 3 }]} value={nomeRua} onChangeText={setNomeRua} placeholder="Rua" />
            <TextInput style={[styles.campoInput, { flex: 1, marginLeft: 10 }]} value={numeroResidencia} onChangeText={setNumeroResidencia} keyboardType="numeric" placeholder="Nº" />
          </View>

          <TouchableOpacity style={[styles.botaoAcao, { backgroundColor: AZUL_MOOVE }]} onPress={processarSalvamento} disabled={estaSalvando}>
            {estaSalvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotao}>SALVAR</Text>}
          </TouchableOpacity>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#fff' },
  containerCentralizado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  areaPrincipal: { flex: 1 },
  conteudoScroll: { padding: 25, paddingBottom: 50 },
  blocoCabecalho: { marginBottom: 20 },
  textoTitulo: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
  detalheLinha: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 10 },
  rotuloCampo: { fontSize: 10, fontWeight: '700', color: '#999', marginBottom: 5, textTransform: 'uppercase' },
  campoInput: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  containerPicker: { backgroundColor: '#f8f9fa', borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  divisorEspacador: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  fileiraDupla: { flexDirection: 'row' },
  botaoAcao: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  textoBotao: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  botaoStatus: { padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginBottom: 20 },
  
  // ESTILOS DA LISTA DE SUGESTÕES
  containerListaAbsoluta: {
    position: 'absolute',
    top: 55, // Logo abaixo do input
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 10, // Sombra para Android
    zIndex: 9999,  // Garante que fique acima de tudo
    maxHeight: 200,
  },
  itemSugestao: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  textoSugestao: { color: '#333', fontSize: 14 }
});