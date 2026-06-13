import React, { useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Switch, Alert, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, StatusBar } from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import instancia from '../service/api'; 
import { MenuButtons } from '../componentes/MenuButtons'; 

export default function PainelBot() { 
    const insets = useSafeAreaInsets(); 
    const [loading, setLoading] = useState(false); 
    const [cadastroAberto, setCadastroAberto] = useState(false); 
    const [mensagemLivre, setMensagemLivre] = useState(""); 
    const [dataEdicao, setDataEdicao] = useState(""); 
    const AZUL_MOOVE = "#0056b3"; 

    const executarComando = async (rota: string, titulo: string, dados = {}) => { 
        setLoading(true); 
        try { 
            await instancia.post(rota, dados); 
            Alert.alert("Sucesso", `Executado: ${titulo}`); 
        } catch (error: any) { 
            console.error("ERRO API:", error.response?.data || error.message); 
            const mensagemErroServidor = error.response?.data?.error;
            if (error.response?.status === 53) {
                Alert.alert("Serviço Indisponível", "O bot do WhatsApp está offline ou inicializando no servidor. Aguarde.");
            } else if (mensagemErroServidor) {
                Alert.alert("Erro no Servidor", mensagemErroServidor);
            } else {
                Alert.alert("Falha de Comunicação", "Não foi possível conectar ao servidor. Verifique o IP da API.");
            }
        } finally { 
            setLoading(false); 
        } 
    }; 

    const handleAlternarCadastroStatus = async (valor: boolean) => {
        setCadastroAberto(valor);
        await executarComando('/whatsapp/status-cadastro', `Status Cadastro: ${valor ? 'Aberto' : 'Fechado'}`, { aberto: valor });
    };

    // 🚀 GATILHO 1: Disparar Tarde (Gatilho real parametrizado por dia puro)
    const handleDispararTardeWhats = async () => {
        const numeros = dataEdicao.replace(/\D/g, ''); 
        if (numeros.length !== 8) { 
            Alert.alert("Data Incompleta", "Digite a data DD/MM/AAAA para saber de qual dia enviar a Tarde."); 
            return; 
        } 
        // Isola os dois primeiros dígitos (ex: "09" vira 9)
        const diaAlvo = parseInt(numeros.substring(0, 2), 10);
        
        setLoading(true);
        try {
            // ⚡ Consome o endpoint correto de GATILHO do robô que você validou
            await instancia.get(`/whatsapp/escala/tarde/${diaAlvo}`);
            
            Alert.alert("Sucesso", `Turno da tarde do dia ${diaAlvo} enviado para o grupo!`);
            setDataEdicao("");
            Keyboard.dismiss();
        } catch (error: any) {
            console.error("Erro no gatilho da tarde:", error.message);
            Alert.alert("Erro", "Não foi possível disparar o relatório da tarde.");
        } finally {
            setLoading(false); // Destrava a interface sempre
        }
    };

    // 🚀 GATILHO 2: Disparar Madrugada (Gatilho real parametrizado por dia puro)
    const handleDispararMadrugadaWhats = async () => {
        const numeros = dataEdicao.replace(/\D/g, ''); 
        if (numeros.length !== 8) { 
            Alert.alert("Data Incompleta", "Digite a data DD/MM/AAAA para saber de qual dia enviar a Madrugada."); 
            return; 
        } 
        // Isola os dois primeiros dígitos (ex: "09" vira 9)
        const diaAlvo = parseInt(numeros.substring(0, 2), 10);
        
        setLoading(true);
        try {
            // ⚡ Consome o endpoint correto de GATILHO do robô que você validou
            await instancia.get(`/whatsapp/escala/madrugada/${diaAlvo}`);
            
            Alert.alert("Sucesso", `Turno da madrugada do dia ${diaAlvo} enviado para o grupo!`);
            setDataEdicao("");
            Keyboard.dismiss();
        } catch (error: any) {
            console.error("Erro no gatilho da madrugada:", error.message);
            Alert.alert("Erro", "Não foi possível disparar o relatório da madrugada.");
        } finally {
            setLoading(false); // Destrava a interface sempre
        }
    };


    const handleConfigurarDataEspecifica = (tipo: 'DIA_LIVRE' | 'DIA_COMUM') => { 
        const numeros = dataEdicao.replace(/\D/g, ''); 
        if (numeros.length !== 8) { 
            Alert.alert("Data Inválida", "Digite a data completa (DD/MM/AAAA)"); 
            return; 
        } 

        const d = numeros.substring(0, 2); 
        const m = numeros.substring(2, 4); 
        const a = numeros.substring(4, 8); 

        const dataFormatadaBR = `${d}/${m}/${a}`; 
        console.log("DATA ENVIADA AO BACKEND:", dataFormatadaBR); 

        executarComando('/whatsapp/configurar-dia', `Agenda (${dataEdicao})`, { 
            data: dataFormatadaBR, 
            tipo: tipo 
        }); 
        
        setDataEdicao(""); 
        Keyboard.dismiss(); 
    };

    const handleRefazerEscalaDoDia = () => {
        const numeros = dataEdicao.replace(/\D/g, ''); 
        if (numeros.length !== 8) { 
            Alert.alert("Data Incompleta", "Digite a data DD/MM/AAAA no campo para sabermos qual escala refazer."); 
            return; 
        } 

        const diaAlvo = parseInt(numeros.substring(0, 2), 10);

        Alert.alert(
            "Refazer Atribuição de Rotas",
            `Deseja recalcular as rotas do dia ${diaAlvo}? Escolha uma ação:`,
            [
                { 
                    text: "Apenas Recalcular", 
                    onPress: () => {
                        executarComando('/whatsapp/escala/refazer', `Recalcular Rotas Dia ${diaAlvo}`, { dia: diaAlvo, enviarWhats: false });
                        setDataEdicao("");
                        Keyboard.dismiss();
                    }
                },
                { 
                    text: "Recalcular e Enviar Whats", 
                    onPress: () => {
                        executarComando('/whatsapp/escala/refazer', `Recalcular e Enviar Rotas Dia ${diaAlvo}`, { dia: diaAlvo, enviarWhats: true });
                        setDataEdicao("");
                        Keyboard.dismiss();
                    }
                },
                { text: "Voltar", style: "cancel" }
            ]
        );
    };

    return ( 
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: '#fff' }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
        > 
            <StatusBar barStyle="dark-content" /> 
            <View style={[styles.mainContainer, { paddingTop: insets.top }]}> 
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}> 
                    
                    <View style={styles.headerSection}> 
                        <Text style={styles.header}>Controle WhatsApp</Text> 
                        <View style={styles.linhaDestaque} /> 
                    </View> 

                    {/* AUTO CADASTRO */} 
                    <View style={styles.card}> 
                        <View style={styles.row}> 
                            <View style={{ flex: 1 }}> 
                                <Text style={styles.cardTitle}>Auto-Cadastro</Text> 
                                <Text style={styles.cardSub}>Permitir @cadastrar no grupo</Text> 
                            </View> 
                            <Switch 
                                value={cadastroAberto} 
                                onValueChange={handleAlternarCadastroStatus} 
                                thumbColor={cadastroAberto ? "#25D366" : "#f4f3f4"} 
                                trackColor={{ false: "#d1d1d1", true: "#81d49d" }} 
                            /> 
                        </View> 
                    </View> 

                    {loading && <ActivityIndicator size="large" color={AZUL_MOOVE} style={{ marginBottom: 20 }} />} 

                    <Text style={styles.sectionTitle}>Escalas e Relatórios</Text> 
                    <View style={styles.grid}> 
                        {/* 🚀 CORRIGIDO: Permite escolher o dia digitado na caixa de texto para disparar a escala mãe oficial */}
                        <MenuButtons 
                            title="Escala" 
                            icon="calendar-check" 
                            color={AZUL_MOOVE} 
                            onPress={() => {
                                const numeros = dataEdicao.replace(/\D/g, ''); 
                                if (numeros.length !== 8) { 
                                    Alert.alert("Data Incompleta", "Digite a data DD/MM/AAAA no campo abaixo para sabermos qual dia de Escala disparar."); 
                                    return; 
                                } 
                                const diaAlvo = parseInt(numeros.substring(0, 2), 10);
                                
                                // Bate na rota parametrizada enviando o dia e forçando o disparo do relatório no grupo
                                executarComando('/whatsapp/escala/refazer', `Disparar Escala Mãe do Dia ${diaAlvo}`, { 
                                    dia: diaAlvo, 
                                    enviarWhats: true 
                                });
                                
                                setDataEdicao("");
                                Keyboard.dismiss();
                            }} 
                        /> 
                        <MenuButtons title="Lista Whats" icon="account-group" color={AZUL_MOOVE} onPress={() => executarComando('/whatsapp/enviar-lista-motoristas', 'Lista')} /> 
                    </View> 

                    <Text style={styles.sectionTitle}>Disparar Turnos Isolados (Whats)</Text> 
                    <View style={styles.grid}> 
                        <MenuButtons 
                            title="Escala da Tarde" 
                            icon="weather-sunset" 
                            color="#fa8c16" 
                            onPress={handleDispararTardeWhats} 
                        /> 
                        <MenuButtons 
                            title="Escala da Noite" 
                            icon="weather-night" 
                            color="#722ed1" 
                            onPress={handleDispararMadrugadaWhats} 
                        /> 
                    </View>


                    <Text style={styles.sectionTitle}>Ações para Hoje</Text> 
                    <View style={styles.grid}> 
                        <MenuButtons title="Zerar Fila" icon="trash-can-outline" color="#FF3B30" onPress={() => { 
                            Alert.alert("Limpar", "Apagar joinhas de hoje?", [{text: "Não"}, {text: "Sim", onPress: () => executarComando('/whatsapp/limpar-fila', 'Limpeza')}]); 
                        }} /> 
                        
                        <MenuButtons title="Config. Hoje" icon="calendar-today" color={AZUL_MOOVE} onPress={() => { 
                            Alert.alert("Tipo de Dia", "Configurar hoje como:", [ 
                                { text: "Livre", onPress: () => executarComando('/whatsapp/configurar-dia', 'Hoje Livre', { data: "hoje", tipo: "DIA_LIVRE" })}, 
                                { text: "Comum", onPress: () => executarComando('/whatsapp/configurar-dia', 'Hoje Comum', { data: "hoje", tipo: "DIA_COMUM" })}, 
                                { text: "Voltar", style: "cancel" }
                            ]); 
                        }} /> 
                    </View> 

                    <Text style={styles.sectionTitle}>Agendar Data Específica</Text> 
                    <View style={styles.card}> 
                        <TextInput 
                            style={styles.inputData} 
                            placeholder="DD/MM/AAAA" 
                            placeholderTextColor="#999"
                            keyboardType="numeric" 
                            maxLength={10} 
                            value={dataEdicao} 
                            onChangeText={(t) => { 
                                let v = t.replace(/\D/g, '').slice(0, 8); 
                                if (v.length >= 5) v = `${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4)}`; 
                                else if (v.length >= 3) v = `${v.slice(0,2)}/${v.slice(2)}`; 
                                setDataEdicao(v); 
                            }} 
                        /> 
                        <View style={styles.row}> 
                            <TouchableOpacity style={[styles.btnMini, {backgroundColor: '#f0f7ff'}]} onPress={() => handleConfigurarDataEspecifica('DIA_LIVRE')}> 
                                <Text style={[styles.btnMiniText, {color: AZUL_MOOVE}]}>MARCAR LIVRE</Text> 
                            </TouchableOpacity> 
                            <TouchableOpacity style={[styles.btnMini, {backgroundColor: '#f0f7ff'}]} onPress={() => handleConfigurarDataEspecifica('DIA_COMUM')}> 
                                <Text style={[styles.btnMiniText, {color: AZUL_MOOVE}]}>MARCAR COMUM</Text> 
                            </TouchableOpacity> 
                        </View> 

                        <TouchableOpacity 
                            style={styles.btnRefazerRotas} 
                            onPress={handleRefazerEscalaDoDia}
                            activeOpacity={0.7}
                        > 
                            <Text style={styles.btnRefazerRotasText}>REFAZER ATRIBUIÇÃO DE ROTAS</Text> 
                        </TouchableOpacity> 
                    </View> 
                    <View style={styles.card}> 
                        <Text style={styles.cardTitle}>Comunicado Oficial</Text> 
                        <TextInput 
                            style={styles.textArea} 
                            placeholder="Aviso..." 
                            placeholderTextColor="#999"
                            maxLength={255}
                            multiline 
                            value={mensagemLivre} 
                            onChangeText={setMensagemLivre} 
                        /> 
                        <TouchableOpacity 
                            style={[styles.btnSend, {backgroundColor: AZUL_MOOVE}]} 
                            onPress={() => { 
                                if(!mensagemLivre.trim()) {
                                    Alert.alert("Aviso", "O texto do comunicado não pode estar vazio.");
                                    return;
                                }
                                executarComando('/whatsapp/comunicado', 'Aviso', { mensagem: mensagemLivre }); 
                                setMensagemLivre(""); 
                                Keyboard.dismiss(); 
                            }}
                        > 
                            <Text style={styles.btnText}>ENVIAR</Text> 
                        </TouchableOpacity> 
                    </View> 
                </ScrollView> 
            </View> 
        </KeyboardAvoidingView> 
    ); 
}
const styles = StyleSheet.create({ 
    mainContainer: { flex: 1, backgroundColor: '#fff' }, 
    scrollContent: { padding: 20 }, 
    headerSection: { marginBottom: 20 }, 
    header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' }, 
    linhaDestaque: { height: 4, width: 40, backgroundColor: '#0056b3', marginTop: 5, borderRadius: 2 }, 
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#999', marginVertical: 10, textTransform: 'uppercase' }, 
    card: { padding: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 15 }, 
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, 
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' }, 
    cardSub: { fontSize: 12, color: '#666' }, 
    grid: { flexDirection: 'row', justifyContent: 'space-between' }, 
    inputData: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, textAlign: 'center', fontSize: 18, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', color: '#333' }, 
    btnMini: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 }, 
    btnMiniText: { fontSize: 11, fontWeight: 'bold' }, 
    textArea: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, minHeight: 80, marginTop: 10, borderWidth: 1, borderColor: '#ddd', color: '#333' }, 
    btnSend: { backgroundColor: '#0056b3', padding: 15, borderRadius: 10, marginTop: 10, alignItems: 'center' }, 
    btnText: { color: '#fff', fontWeight: 'bold' },
    btnRefazerRotas: { 
        backgroundColor: '#0056b3', 
        padding: 15, 
        borderRadius: 14, 
        marginTop: 15, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f2f2f2',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    }, 
    btnRefazerRotasText: { 
        color: '#f2f2f2', 
        fontWeight: '700',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1
    } 
});