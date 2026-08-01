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

    // Unificamos toda a lógica de alteração e fechamento em um único handler limpo
    const handlePickerChange = (event: any, selectedDate?: Date) => {
        // No Android, o picker deve fechar imediatamente após a seleção
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        // Se o usuário cancelou (clicou fora ou no botão cancelar)
        if (event?.type === 'dismissed') {
            setShowPicker(false);
            return;
        }

        // Se uma data válida foi escolhida
        if (selectedDate) {
            setDataSelecionada(selectedDate);
        }
    };

    const buscarFilaPorData = () => {
        const ano = dataSelecionada.getFullYear();
        const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
        const dia = String(dataSelecionada.getDate()).padStart(2, '0');
        
        const dataId = `${ano}-${mes}-${dia}`;
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
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    // Mantemos apenas a propriedade oficial estável para evitar conflito de APIs híbridas
                    onChange={handlePickerChange}
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