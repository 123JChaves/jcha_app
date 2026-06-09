import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import instancia from '../../../../../service/api';

export default function EditarRota() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const idRota = route.params?.id;

  const [estaCarregando, setEstaCarregando] = useState(true);
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [passageirosNaRota, setPassageirosNaRota] = useState<any[]>([]);
  const [passageirosDisponiveis, setPassageirosDisponiveis] = useState<any[]>([]);
  const [dadosRota, setDadosRota] = useState({ nome: '', ordem: '', tipo: 'ROTA_MADRUGADA', horario: '', empresaId: '' });

  const AZUL_MOOVE = "#0056b3";

  useEffect(() => {
    carregarTudo();
  }, [idRota]);

  const carregarTudo = async () => {
    try {
      const { data: r } = await instancia.get(`/rota/${idRota}`);
      const idEmp = r.empresas?.[0]?.id;

      setDadosRota({ 
        nome: r.nome, 
        ordem: r.ordem, 
        tipo: r.tipo_rota, 
        horario: r.horario, 
        empresaId: idEmp 
      });
      setPassageirosNaRota(r.passageiros || []);
      
      const { data: disp } = await instancia.get(`/passageiros/disponiveis/${idEmp}`);
      setPassageirosDisponiveis(disp);
    } catch (e) { 
      navigation.goBack(); 
    } finally { 
      setEstaCarregando(false); 
    }
  };

  const mover = (index: number, up: boolean) => {
    const list = [...passageirosNaRota];
    const target = up ? index - 1 : index + 1;
    if (target >= 0 && target < list.length) {
      [list[index], list[target]] = [list[target], list[index]];
      setPassageirosNaRota(list);
    }
  };

  const salvar = async () => {
    setEstaSalvando(true);
    try {
      const payload = {
        nome: dadosRota.nome,
        ordem: dadosRota.ordem,
        tipo_rota: dadosRota.tipo,
        horario: dadosRota.horario,
        empresaId: Number(dadosRota.empresaId),
        passageirosIds: passageirosNaRota.map(p => p.id)
      };

      await instancia.put(`/rota/${idRota}`, payload);
      Alert.alert("Sucesso", "Rota atualizada!");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro", "Erro ao salvar.");
    } finally {
      setEstaSalvando(false);
    }
  };

  if (estaCarregando) return <View style={styles.centro}><ActivityIndicator size="large" color={AZUL_MOOVE} /></View>;

  return (
    <ScrollView style={styles.tela} contentContainerStyle={{ padding: 20 }}>
      <TextInput style={styles.input} value={dadosRota.ordem} onChangeText={t => setDadosRota({...dadosRota, ordem: t})} placeholder="Ordem" />
      <TextInput style={styles.input} value={dadosRota.nome} onChangeText={t => setDadosRota({...dadosRota, nome: t})} placeholder="Nome da Rota" />

      <Text style={styles.labelSeccao}>Passageiros na Rota</Text>
      {passageirosNaRota.map((p, index) => (
        <View key={p.id} style={styles.card}>
          <View style={styles.setas}>
            <TouchableOpacity onPress={() => mover(index, true)}><MaterialCommunityIcons name="chevron-up" size={24} color={AZUL_MOOVE} /></TouchableOpacity>
            <TouchableOpacity onPress={() => mover(index, false)}><MaterialCommunityIcons name="chevron-down" size={24} color={AZUL_MOOVE} /></TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}><Text style={styles.nome}>{p.nome}</Text></View>
          <TouchableOpacity onPress={() => {
            setPassageirosDisponiveis([...passageirosDisponiveis, p]);
            setPassageirosNaRota(passageirosNaRota.filter(x => x.id !== p.id));
          }}><MaterialCommunityIcons name="minus-circle" size={26} color="#FF3B30" /></TouchableOpacity>
        </View>
      ))}

      <Text style={styles.labelSeccao}>Disponíveis</Text>
      {passageirosDisponiveis.map(p => (
        <TouchableOpacity key={p.id} style={styles.itemDisp} onPress={() => {
          setPassageirosNaRota([...passageirosNaRota, p]);
          setPassageirosDisponiveis(passageirosDisponiveis.filter(x => x.id !== p.id));
        }}>
          <Text>{p.nome}</Text>
          <MaterialCommunityIcons name="plus-circle" size={26} color={AZUL_MOOVE} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btn} onPress={salvar} disabled={estaSalvando}>
        {estaSalvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTexto}>SALVAR</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#fff' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  labelSeccao: { fontWeight: '800', marginVertical: 15 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginBottom: 5 },
  setas: { marginRight: 10 },
  nome: { fontWeight: '700' },
  itemDisp: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  btn: { backgroundColor: '#111', padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnTexto: { color: '#fff', fontWeight: 'bold' }
});