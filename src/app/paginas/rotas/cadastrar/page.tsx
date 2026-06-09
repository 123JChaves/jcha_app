import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import instancia from '../../../../service/api';
import IEmpresa from '../../../../@types/interfaces/IEmpresa';
import IPassageiro from '../../../../@types/interfaces/IPassageiro';

export default function CadastrarRotas() {
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [listaEmpresas, setListaEmpresas] = useState<IEmpresa[]>([]);
  const [passageirosDisponiveis, setPassageirosDisponiveis] = useState<IPassageiro[]>([]);
  
  // Estados do Formulário
  const [idEmpresa, setIdEmpresa] = useState("");
  const [tipoRota, setTipoRota] = useState<'ROTA_TARDE' | 'ROTA_MADRUGADA'>('ROTA_MADRUGADA');
  const [ordemRota, setOrdemRota] = useState(""); 
  const [areaLivre, setAreaLivre] = useState(""); 
  const [horarioChegada, setHorarioChegada] = useState(""); 
  const [passageirosNaRota, setPassageirosNaRota] = useState<IPassageiro[]>([]);

  const AZUL_MOOVE = "#0056b3";
  const DOURADO = "#D4AF37";
  const BASE_URL_IMAGENS = process.env.EXPO_PUBLIC_URL_IMAGEM;

  // 1. Carrega as Empresas cadastradas
  useEffect(() => {
    instancia.get<IEmpresa[]>('/empresas')
      .then(res => setListaEmpresas(res.data))
      .catch(() => Alert.alert("Erro", "Não foi possível carregar as empresas."));
  }, []);

  // 2. Carrega Passageiros da Empresa selecionada que NÃO possuem rota
  useEffect(() => {
    if (idEmpresa) {
      setEstaCarregando(true);
      instancia.get<IPassageiro[]>(`/passageiros/disponiveis/${idEmpresa}`)
        .then(res => {
          setPassageirosDisponiveis(res.data);
          setPassageirosNaRota([]); 
        })
        .catch(() => Alert.alert("Erro", "Falha ao buscar passageiros."))
        .finally(() => setEstaCarregando(false));
    } else {
      setPassageirosDisponiveis([]);
      setPassageirosNaRota([]);
    }
  }, [idEmpresa]);

  const empresaSelecionada = listaEmpresas.find(e => String(e.id) === idEmpresa);

  const adicionarAosSelecionados = (passageiro: IPassageiro) => {
    // Adiciona ao array de selecionados e remove da lista de disponíveis
    setPassageirosNaRota(prev => [...prev, passageiro]);
    setPassageirosDisponiveis(prev => prev.filter(p => p.id !== passageiro.id));
  };

  const removerDosSelecionados = (passageiro: IPassageiro) => {
    // Devolve para a lista de disponíveis e remove da rota
    setPassageirosDisponiveis(prev => [...prev, passageiro]);
    setPassageirosNaRota(prev => prev.filter(p => p.id !== passageiro.id));
  };

  const processarSalvamentoRota = async () => {
    if (!idEmpresa || !ordemRota || !areaLivre || !horarioChegada || passageirosNaRota.length === 0) {
      Alert.alert("Atenção", "Preencha todos os campos e selecione ao menos um passageiro.");
      return;
    }

    const payload = {
      nome: areaLivre.trim(),
      ordem: ordemRota.trim(),
      tipo_rota: tipoRota,
      horario: horarioChegada.trim(),
      empresaId: Number(idEmpresa),
      passageirosIds: passageirosNaRota.map(p => p.id)
    };

    try {
      setEstaCarregando(true);
      await instancia.post('/rota', payload);
      Alert.alert("Sucesso", "A rota foi montada e salva com sucesso!");
      
      setOrdemRota("");
      setAreaLivre("");
      setHorarioChegada("");
      setPassageirosNaRota([]);
      // Recarrega disponíveis para limpar quem foi vinculado
      if(idEmpresa) {
        const res = await instancia.get<IPassageiro[]>(`/passageiros/disponiveis/${idEmpresa}`);
        setPassageirosDisponiveis(res.data);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Servidor indisponível.";
      Alert.alert("Erro ao Salvar", msg);
    } finally {
      setEstaCarregando(false);
    }
  };

  const retornarEmojiNumero = (posicao: number) => {
    const numeros = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    return numeros[posicao] || `${posicao + 1}.`;
  };

  return (
    <View style={styles.tela}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.conteudoScroll} 
        keyboardShouldPersistTaps="always"
      >
        
        {/* PREVIEW DA ROTA */}
        <View style={styles.cardPreview}>
          <View style={styles.row}>
            <View style={styles.logoEmpresaWrapper}>
              {empresaSelecionada?.logo ? (
                <Image source={{ uri: `${BASE_URL_IMAGENS}/${empresaSelecionada.logo}` }} style={styles.logoEmpresa} />
              ) : (
                <MaterialCommunityIcons name="office-building" size={20} color="#ccc" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.textoPreview}>
                <Text style={{ fontWeight: '900' }}>🔹 {empresaSelecionada?.nome || "EMPRESA"}</Text>
                {ordemRota ? ` - ${ordemRota.toUpperCase()}` : ""}
                {areaLivre ? ` - ${areaLivre}` : ""}
              </Text>
              <Text style={styles.horarioPreview}>
                {horarioChegada ? `🕒 ${horarioChegada} (Chegada funcionários)` : "🕒 --h--"}
              </Text>
            </View>
          </View>
          <View style={[styles.linhaDestaque, { backgroundColor: DOURADO }]} />
        </View>

        <Text style={styles.label}>Configuração da Rota</Text>
        
        <View style={styles.inputAgrupado}>
          <Picker selectedValue={idEmpresa} onValueChange={(v) => setIdEmpresa(v)}>
            <Picker.Item label="Selecione a Empresa..." value="" color="#999" />
            {listaEmpresas.map(emp => (
              <Picker.Item key={`emp-${emp.id}`} label={emp.nome} value={String(emp.id)} />
            ))}
          </Picker>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputAgrupado, { flex: 1, marginRight: 10 }]}>
            <Picker selectedValue={tipoRota} onValueChange={(v) => setTipoRota(v as any)}>
              <Picker.Item label="Madrugada" value="ROTA_MADRUGADA" />
              <Picker.Item label="Tarde" value="ROTA_TARDE" />
            </Picker>
          </View>
          <TextInput 
            style={[styles.campoInput, { flex: 1 }]} 
            placeholder="Horário" 
            value={horarioChegada} 
            onChangeText={setHorarioChegada}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.row}>
          <TextInput 
            style={[styles.campoInput, { flex: 1, marginRight: 10 }]} 
            placeholder="Ex: ROTA 1" 
            value={ordemRota} 
            onChangeText={setOrdemRota}
            placeholderTextColor="#bbb"
          />
          <TextInput 
            style={[styles.campoInput, { flex: 2 }]} 
            placeholder="Batel / Urupês" 
            value={areaLivre} 
            onChangeText={setAreaLivre}
            placeholderTextColor="#bbb"
          />
        </View>

        <Text style={styles.tituloSeccao}>Passageiros na Rota ({passageirosNaRota.length})</Text>
        {passageirosNaRota.length === 0 && <Text style={styles.avisoVazio}>Selecione os passageiros na lista abaixo.</Text>}
        
        {passageirosNaRota.map((item, index) => (
          <View key={`rota-${item.id}`} style={styles.cardPassageiro}>
            <Text style={styles.numeroPosicao}>{retornarEmojiNumero(index)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nomePassageiro}>{item.nome}</Text>
              <Text style={styles.enderecoPassageiro}>
                {item.endereco?.nome}, {item.endereco?.numero}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removerDosSelecionados(item)} activeOpacity={0.6}>
              <MaterialCommunityIcons name="close-circle-outline" size={26} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.divisor} />

        <Text style={styles.tituloSeccao}>Disponíveis na Empresa</Text>
        {estaCarregando ? <ActivityIndicator size="small" color={AZUL_MOOVE} /> : (
          passageirosDisponiveis.map(item => (
            <TouchableOpacity 
              key={`disp-${item.id}`} 
              style={styles.cardDisponivel} 
              onPress={() => adicionarAosSelecionados(item)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.nomePassageiro}>{item.nome}</Text>
                <Text style={styles.enderecoPassageiro}>{item.endereco?.nome}</Text>
              </View>
              <MaterialCommunityIcons name="plus-circle-outline" size={26} color={AZUL_MOOVE} />
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity 
          style={[styles.botaoSalvar, { backgroundColor: estaCarregando ? '#ccc' : '#1a1a1a' }]} 
          onPress={processarSalvamentoRota}
          disabled={estaCarregando}
        >
          {estaCarregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotao}>FINALIZAR ROTA</Text>}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#fff' },
  conteudoScroll: { padding: 20, paddingBottom: 60 },
  cardPreview: { backgroundColor: '#f8f9fa', padding: 18, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: '#eee', elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center' },
  logoEmpresaWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden' },
  logoEmpresa: { width: '100%', height: '100%' },
  textoPreview: { fontSize: 15, color: '#0056b3', flex: 1 },
  horarioPreview: { fontSize: 13, color: '#666', marginTop: 4 },
  linhaDestaque: { height: 3, width: 45, marginTop: 12, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: '800', color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  inputAgrupado: { backgroundColor: '#f8f9fa', borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 15, justifyContent: 'center' },
  campoInput: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 15, fontSize: 15, color: '#333' },
  tituloSeccao: { fontSize: 16, fontWeight: '800', color: '#111', marginTop: 15, marginBottom: 15 },
  avisoVazio: { color: '#bbb', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  cardPassageiro: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e0eaff', elevation: 2 },
  numeroPosicao: { fontSize: 20, marginRight: 15 },
  nomePassageiro: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  enderecoPassageiro: { fontSize: 12, color: '#666', marginTop: 2 },
  cardDisponivel: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8f8f8' },
  divisor: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },
  botaoSalvar: { padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1.5 }
});