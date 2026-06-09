import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MenuPlantoes() {
    const navigation = useNavigation<any>();
    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    
    const AZUL_MOOVE = "#0056b3";

    const onChange = (event: any, selectedDate?: Date) => {
        // Correção para iOS: mantém o seletor aberto até o usuário terminar a ação
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        // Se o usuário clicou em Cancelar ou fechou no Android, interrompe sem bugar o estado
        if (event.type === 'dismissed') {
            setShowPicker(false);
            return;
        }

        // Atualiza a data se o usuário selecionou uma com sucesso
        if (selectedDate) {
            setDataSelecionada(selectedDate);
        }
    };

    const buscarFilaPorData = () => {
        const ano = dataSelecionada.getFullYear();
        const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
        const dia = String(dataSelecionada.getDate()).padStart(2, '0');
        
        // Gera o ID no formato AAAA-MM-DD para os parâmetros da rota
        const dataId = `${ano}-${mes}-${dia}`;

        // Navega de forma segura enviando os parâmetros para o StackNavigator
        navigation.navigate('DetalhePlantao', { id: dataId });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Escalas e Plantões</Text>
                <View style={styles.linhaDestaque} />
            </View>

            <Text style={styles.label}>Consulte o histórico de joinhas:</Text>
            
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
                <MaterialCommunityIcons name="calendar-month" size={24} color={AZUL_MOOVE} />
                <Text style={styles.dateText}>
                    {`${String(dataSelecionada.getDate()).padStart(2, '0')}/${String(dataSelecionada.getMonth() + 1).padStart(2, '0')}/${dataSelecionada.getFullYear()}`}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={dataSelecionada}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Melhora o visual dependendo do sistema
                    onChange={onChange}
                />
            )}

            <TouchableOpacity style={styles.botaoBuscar} onPress={buscarFilaPorData}>
                <Text style={styles.botaoTexto}>Buscar Fila de Joinhas</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    header: { marginBottom: 30, marginTop: 10 },
    titulo: { color: '#1a1a1a', fontSize: 24, fontWeight: '800' },
    linhaDestaque: { height: 4, width: 30, backgroundColor: '#0056b3', marginTop: 8, borderRadius: 2 },
    label: { fontSize: 15, color: '#666', marginBottom: 10, fontWeight: '500' },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#f9f9f9'
    },
    dateText: { fontSize: 16, marginLeft: 10, color: '#1a1a1a', fontWeight: '600' },
    botaoBuscar: {
        backgroundColor: '#0056b3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});