import React, { useEffect, useState, useRef } from 'react'; 
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    ActivityIndicator, 
    StatusBar, 
    Alert, 
    TouchableOpacity, 
    Keyboard, 
    TextInput 
} from 'react-native'; 
import { useRoute, useIsFocused } from '@react-navigation/native'; 
import instancia from '../../../../service/api'; 
import IMotoristaEscala from '../../../../@types/interfaces/IMotoristaEscala';
import IRotaAtribuida from '../../../../@types/interfaces/IRotaAtribuida';

export default function DetalhePlantao() { 
    const route = useRoute<any>(); 
    const isFocused = useIsFocused(); 
    const { id } = route.params || {}; 
    
    // Estados Principais de Dados
    const [abaAtiva, setAbaAtiva] = useState<'ESCALA' | 'TARDE' | 'MADRUGADA'>('ESCALA');
    const [listaEscala, setListaEscala] = useState<IMotoristaEscala[]>([]);
    const [listaRotas, setListaRotas] = useState<IRotaAtribuida[]>([]);
    const [loading, setLoading] = useState<boolean>(true); 
    const [buscandoDados, setBuscandoDados] = useState<boolean>(false); 
    
    const [dataExibicaoDinamica, setDataExibicaoDinamica] = useState<string>('');
    const [tipoDiaTexto, setTipoDiaTexto] = useState<string>('');
    const [idListaBanco, setIdListaBanco] = useState<number>(0); 

    // Estados do Formulário de Busca Geral (Barra do Topo)
    const [nomeBuscaInput, setNomeBuscaInput] = useState<string>('');
    const [novaPosicaoInput, setNovaPosicaoInput] = useState<string>('');
    const [motoristaSelecionado, setMotoristaSelecionado] = useState<{ whatsAppLid: string; nome: string } | null>(null);
    const [sugestoesMotoristas, setSugestoesMotoristas] = useState<any[]>([]);
    const [buscandoMotoristas, setBuscandoMotoristas] = useState<boolean>(false);

    // Estados para o Controle de Autocomplete Inline (Dentro dos Cards de Rota Vaga)
    const [filtroNomeRotaInput, setFiltroNomeRotaInput] = useState<string>('');
    const [sugestoesGlobaisRota, setSugestoesGlobaisRota] = useState<any[]>([]);

    // Estados para controle da tela cheia de busca inline dentro das rotas
    const [rotaEmEdicaoObjeto, setRotaEmEdicaoObjeto] = useState<IRotaAtribuida | null>(null);
    
    const AZUL_MOOVE = "#0056b3"; 
    const timerBuscaRef = useRef<any>(null);

    // Função para subtrair 1 dia da data ISO (Ajuste Cronológico Blindado)
    const subtrairUmDia = (dataIso: string): string => {
        if (!dataIso) return '';
        const stringLimpa = dataIso.replace(/\//g, '-');
        const partes = stringLimpa.split('-');
        if (partes.length !== 3) return dataIso;
        
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const dia = parseInt(partes[2], 10);
        
        const dataObjeto = new Date(ano, mes -1, dia, 12, 0, 0, 0);
        dataObjeto.setDate(dataObjeto.getDate() - 1);
        
        return `${dataObjeto.getFullYear()}-${String(dataObjeto.getMonth() + 1).padStart(2, '0')}-${String(dataObjeto.getDate()).padStart(2, '0')}`;
    };

    const carregarDadosAba = async () => { 
        if (buscandoDados) return;
        try {
            setLoading(true);
            setBuscandoDados(true);
            
            if (abaAtiva === 'ESCALA') {
                setListaEscala([]);
                const res = await instancia.get(`/whatsapp/escala`, { params: { data: id } });
                
                const dadosTratados = (res.data.dados || []).map((item: any, index: number) => ({
                    ...item,
                    chaveUnica: item.whatsAppLid ? `${item.whatsAppLid}_${index}` : `mot_${index}`
                }));
                
                setListaEscala(dadosTratados);
                setTipoDiaTexto(res.data.tipoDia || '');
                setDataExibicaoDinamica(res.data.dataExibicaoTexto || ''); 
                setIdListaBanco(res.data.listaId || 0); 
            } else {
                setListaRotas([]);

                const dataParametro = abaAtiva === 'MADRUGADA' ? subtrairUmDia(id) : id;
                const urlAlvo = abaAtiva === 'TARDE' ? `/whatsapp/rotas-tarde` : `/whatsapp/rotas-madrugada`;
                const res = await instancia.get(urlAlvo, { params: { data: dataParametro } });
                
                // Normaliza o payload para aceitar arrays ou objetos indexados
                const dadosCruas = res.data.dados || [];
                const dadosRotas = Array.isArray(dadosCruas) ? dadosCruas : Object.values(dadosCruas);
                
                setListaRotas(dadosRotas);
                if (res.data.dataExibicaoTexto) {
                    setDataExibicaoDinamica(res.data.dataExibicaoTexto);
                }
            }
        } catch (error: any) { 
            // 🔥 INSPEÇÃO OPERACIONAL EM TELA: Captura a stack trace ou mensagem real de estouro de memória
            const descricaoErroJs = error?.message || "Erro JavaScript Genérico";
            const statusHttp = error?.response?.status || "Sem Status HTTP";
            const respostaServidor = JSON.stringify(error?.response?.data || "Sem corpo de resposta");

            // Força a exibição amigável dos dados brutos quebrados para você debugar visualmente
            Alert.alert(
                "🚨 DETECTOR DE FALHAS REAL",
                `Mensagem JS: ${descricaoErroJs}\n\nStatus API: ${statusHttp}\n\nRetorno Banco: ${respostaServidor.substring(0, 200)}`
            );
        } finally { 
            setLoading(false); 
            setBuscandoDados(false);
        } 
    };

    useEffect(() => { 
        let ativo = true;
        if (isFocused && id && ativo) {
            carregarDadosAba(); 
        }
        return () => { ativo = false; };
    }, [isFocused, id, abaAtiva]);
    const lidarComMudancaTextoNome = async (texto: string) => {
        setNomeBuscaInput(texto);
        setMotoristaSelecionado(null); 

        if (timerBuscaRef.current) clearTimeout(timerBuscaRef.current);

        if (texto.trim().length >= 3) {
            timerBuscaRef.current = setTimeout(async () => {
                try {
                    setBuscandoMotoristas(true);
                    const res = await instancia.get('/whatsapp/motoristas/buscar-por-nome', {
                        params: { nome: texto.trim() }
                    });
                    setSugestoesMotoristas(res.data || []);
                } catch (err) {
                    console.error("Erro ao buscar motoristas por nome:", err);
                } finally {
                    setBuscandoMotoristas(false);
                }
            }, 400);
        } else {
            setSugestoesMotoristas([]);
        }
    };

    const selecionarMotoristaSugerido = (motorista: { whatsAppLid: string; nome: string }) => {
        setMotoristaSelecionado(motorista);
        setNomeBuscaInput(motorista.nome); 
        setSugestoesMotoristas([]); 
        Keyboard.dismiss();
    };

    const handleInserirManual = async () => {
        if (!motoristaSelecionado || !novaPosicaoInput.trim() || !idListaBanco) {
            Alert.alert("Aviso", "Selecione um motorista da lista sugerida e informe a posição.");
            return;
        }
        const pos = parseInt(novaPosicaoInput, 10);
        if (isNaN(pos) || pos < 1) {
            Alert.alert("Erro", "A posição deve ser um número válido.");
            return;
        }
        try {
            setLoading(true);
            await instancia.post('/whatsapp/escala/inserir', { 
                whatsappId: motoristaSelecionado.whatsAppLid, 
                listaId: idListaBanco, 
                posicaoAlvo: pos 
            });
            setNomeBuscaInput('');
            setNovaPosicaoInput('');
            setMotoristaSelecionado(null);
            carregarDadosAba(); 
        } catch (err: any) {
            Alert.alert("Erro ao Inserir", err.response?.data?.error || "Falha na inserção.");
        } finally {
            setLoading(false);
        }
    };

    const handleMoverMotorista = async (whatsappId: string, posicaoAtual: number, direcao: 'SUBIR' | 'DESCER') => {
        if (!idListaBanco) return;
        const novaPosicaoAlvo = direcao === 'SUBIR' ? posicaoAtual - 1 : posicaoAtual + 1;
        try {
            setLoading(true);
            await instancia.post('/whatsapp/escala/mover', {
                whatsappId,
                listaId: idListaBanco,
                novaPosicaoAlvo
            });
            carregarDadosAba();
        } catch (err: any) {
            Alert.alert("Erro", err.response?.data?.error || "Falha ao reordenar motorista.");
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirMotorista = (whatsappId: string, nome: string) => {
        if (!idListaBanco) return;
        Alert.alert(
            "Remover da Fila",
            `Deseja tirar ${nome} da escala de hoje?`,
            [
                { text: "Não", style: "cancel" },
                { text: "Sim", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        await instancia.post('/whatsapp/escala/remover', { whatsappId, listaId: idListaBanco });
                        carregarDadosAba(); 
                    } catch (err: any) {
                        Alert.alert("Erro", err.response?.data?.error || "Falha ao remover.");
                    } finally {
                        setLoading(false);
                    }
                }}
            ]
        );
    };

    const handleForcarEscalaApoio = async (whatsappId: string) => {
        if (!idListaBanco) {
            Alert.alert("Erro", "ID da lista não identificado. Carregue os dados novamente.");
            return;
        }
        try {
            setLoading(true);
            await instancia.post('/whatsapp/escala/apoio-manual', { whatsappId, listaId: idListaBanco });
            Alert.alert("Sucesso", "Motorista fixado e congelado na escala de Apoio!");
            carregarDadosAba(); 
        } catch (err: any) {
            Alert.alert("Erro", err.response?.data?.error || "Falha ao alocar o motorista na escala de apoio.");
        } finally {
            setLoading(false);
        }
    };

    const handleDesfixarEscalaApoio = async (whatsappId: string) => {
        if (!idListaBanco) return;
        try {
            setLoading(true);
            await instancia.post('/whatsapp/escala/apoio-desfixar', { whatsappId, listaId: idListaBanco });
            Alert.alert("Sucesso", "O motorista foi reintegrado à ordem de fila normal.");
            carregarDadosAba(); 
        } catch (err: any) {
            Alert.alert("Erro", err.response?.data?.error || "Falha ao remover fixação.");
        } finally {
            setLoading(false);
        }
    };

    const handleForcarRotaApoio = async (whatsappId: string, rotaId: number) => {
        if (!idListaBanco) return;
        try {
            setLoading(true);
            await instancia.post('/whatsapp/escala/rota-manual', { whatsappId, listaId: idListaBanco, rotaId });
            Alert.alert("Sucesso", "Motorista alocado na rota comercial!");
            carregarDadosAba();
        } catch (err: any) {
            Alert.alert("Erro de Atribuição", err.response?.data?.error || "Falha ao alocar o motorista.");
        } finally {
            setLoading(false);
        }
    };

    const handleDesvincularRota = async (rotaId: number) => {
        if (!idListaBanco) return;
        try {
            setLoading(true);
            await instancia.post('/whatsapp/escala/rota-manual', { whatsappId: "", listaId: idListaBanco, rotaId });
            Alert.alert("Sucesso", "A vaga foi aberta e encontra-se disponível novamente.");
            carregarDadosAba(); 
        } catch (err: any) {
            Alert.alert("Erro ao Desvincular", err.response?.data?.error || "Falha ao remover motorista.");
        } finally {
            setLoading(false);
        }
    };

    const handleRedistribuirOriginal = () => {
        Alert.alert(
            "Redistribuir Escala",
            "Deseja limpar as alterações manuais e rodar a redistribuição automática do robô para este dia?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sim, Redistribuir", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        const res = await instancia.post('/whatsapp/escala/redistribuir', null, { params: { data: id } });
                        Alert.alert("Sucesso", res.data.message || "Escala redistribuída com sucesso!");
                        carregarDadosAba();
                    } catch (err: any) {
                        Alert.alert("Erro ao redistribuir", err.response?.data?.error || "Falha na comunicação com o robô.");
                    } finally {
                        setLoading(false);
                    }
                }}
            ]
        );
    };

    const renderizarFilaComLacunas = (): IMotoristaEscala[] => {
        if (listaEscala.length === 0) return [];
        const mapaMotoristas = new Map<number, IMotoristaEscala>();
        let maiorPosicaoSalva = 0;

        listaEscala.forEach(m => {
            const pos = m.posicao || 0;
            mapaMotoristas.set(pos, m);
            if (pos > maiorPosicaoSalva) maiorPosicaoSalva = pos;
        });

        const filaCompleta: IMotoristaEscala[] = [];
        for (let i = 1; i <= maiorPosicaoSalva; i++) {
            const motoristaExistente = mapaMotoristas.get(i);
            if (motoristaExistente) {
                filaCompleta.push(motoristaExistente);
            } else {
                filaCompleta.push({
                    id: -i,
                    posicao: i,
                    categoria: "LIVRE",
                    isPenalizado: false,
                    whatsAppLid: `vaga_${i}`,
                    motorista: { nome: "" }
                } as any);
                (filaCompleta[filaCompleta.length - 1] as any).isVagaOperacional = true;
            }
        }
        return filaCompleta;
    };

    const buscarMotoristasParaRota = async (texto: string) => {
        setFiltroNomeRotaInput(texto);
        if (timerBuscaRef.current) clearTimeout(timerBuscaRef.current);
        if (texto.trim().length >= 3) {
            timerBuscaRef.current = setTimeout(async () => {
                try {
                    const res = await instancia.get('/whatsapp/motoristas/buscar-por-nome', { params: { nome: texto.trim() } });
                    setSugestoesGlobaisRota(res.data || []);
                } catch (err) {
                    console.error("Erro na busca direta do banco:", err);
                }
            }, 400);
        } else {
            setSugestoesGlobaisRota([]);
        }
    };
    // 9. RENDERIZADOR DOS CARTÕES DA FILA DA ESCALA (PÁTIO COM CONTROLES VERTICAIS)
    const renderItemEscala = ({ item, index }: { item: IMotoristaEscala; index: number }) => {
        let corGrupo = '#555555';
        if (item.categoria === 'PLANTAO') corGrupo = '#28a745';
        if (item.categoria === 'ROTA') corGrupo = '#0056b3';
        if (item.categoria === 'APOIO') corGrupo = '#fa8c16';

        const ehVagaFicticia = (item as any).isVagaOperacional === true;
        if (ehVagaFicticia) {
            return (
                <View style={[styles.card, { backgroundColor: '#f5f5f5', borderColor: '#e8e8e8', borderStyle: 'dashed' }]}>
                    <View style={[styles.posicaoContainer, { backgroundColor: '#e8e8e8' }]}>
                        <Text style={[styles.posicaoTexto, { color: '#999' }]}>{item.posicao}º</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={[styles.nome, { color: '#999', fontStyle: 'italic' }]}>🔒 POSIÇÃO OPERACIONAL VAGA</Text>
                        <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Aguardando adesão de motorista</Text>
                    </View>
                </View>
            );
        }

        const lidDoMotorista = item.whatsAppLid || '';
        const nomeDoMotorista = item.motorista?.nome || "Motorista não identificado";
        const apenasPlantaoPuro = (item.motorista as any)?.podeFazerRota === false;
        
        const ehApoioManualFixo = item.isApoioManual === true || item.categoria === 'APOIO';
        const ehPlantonistaFila = item.categoria === 'PLANTAO';

        const dadosFilaProcessada = renderizarFilaComLacunas();
        const ehPrimeiro = index === 0;
        const ehUltimo = index === dadosFilaProcessada.length - 1;

        return (
            <View style={[styles.card, item.isPenalizado && styles.cardPenalizado, ehApoioManualFixo && styles.cardApoio]}>
                <View style={styles.posicaoContainer}>
                    <Text style={styles.posicaoTexto}>{item.posicao}º</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.nome}>{nomeDoMotorista}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Text style={[styles.categoriaTexto, { color: corGrupo }]}>
                            📍 {ehApoioManualFixo ? 'APOIO FIXO' : item.categoria}
                        </Text>
                        {apenasPlantaoPuro && (
                            <Text style={{ fontSize: 9, fontWeight: '800', backgroundColor: '#e8e8e8', color: '#555555', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 6 }}>SÓ PLANTÃO</Text>
                        )}
                    </View>

                    {ehApoioManualFixo ? (
                        <TouchableOpacity style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={() => handleDesfixarEscalaApoio(lidDoMotorista)}>
                            <Text style={{ color: '#777777', fontSize: 11, fontWeight: '700' }}>↩️ REMOVER FIXAÇÃO DE APOIO</Text>
                        </TouchableOpacity>
                    ) : (
                        !apenasPlantaoPuro && !ehPlantonistaFila && (
                            <TouchableOpacity style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={() => handleForcarEscalaApoio(lidDoMotorista)}>
                                <Text style={{ color: '#fa8c16', fontSize: 11, fontWeight: '700' }}>⚡ FIXAR COMO APOIO</Text>
                            </TouchableOpacity>
                        )
                    )}
                    
                    {!!item.isPenalizado && <Text style={styles.txtAlerta}>⚠️ QUEIMOU A LARGADA (FIM DA FILA)</Text>}
                </View>

                <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <TouchableOpacity 
                            disabled={ehPrimeiro || ehApoioManualFixo} 
                            style={[styles.btnSeta, (ehPrimeiro || ehApoioManualFixo) && { opacity: 0.2 }]} 
                            onPress={() => handleMoverMotorista(lidDoMotorista, item.posicao, 'SUBIR')}
                        >
                            <Text style={styles.txtSeta}>▲</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            disabled={ehUltimo || ehApoioManualFixo} 
                            style={[styles.btnSeta, (ehUltimo || ehApoioManualFixo) && { opacity: 0.2 }]} 
                            onPress={() => handleMoverMotorista(lidDoMotorista, item.posicao, 'DESCER')}
                        >
                            <Text style={styles.txtSeta}>▼</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity style={{ paddingVertical: 4, paddingHorizontal: 2 }} onPress={() => handleExcluirMotorista(lidDoMotorista, nomeDoMotorista)}>
                        <Text style={{ color: '#cf1322', fontSize: 12, fontWeight: '700' }}>Remover</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    // 10. RENDERIZADOR DAS ROTAS COMERCIAIS (TARDE E MADRUGADA)
    const renderItemRotas = ({ item }: { item: IRotaAtribuida }) => {
        const empresasDaRota = item.empresas || [];
        const primeiraEmpresa = empresasDaRota.length > 0 ? empresasDaRota[0] : null;
        
        const icone = primeiraEmpresa?.icone || '📌';
        const nomeEmpresa = primeiraEmpresa?.nome ? primeiraEmpresa.nome.toUpperCase() : 'ROTA';
        const identificadorRota = item.ordem || '';
        const horarioDaRota = item.horario || '';
        const ehRotaVaga = !item.motorista;
        const idFisicoRota = Number((item as any).id_rota || item.id);

        return (
            <View style={[styles.cardRota, item.tipo === 'APOIO' && styles.cardRotaApoioBackground]}>
                <View style={styles.headerCardRota}>
                    <Text style={styles.txtNomeRota}>{icone} {nomeEmpresa} - {identificadorRota.toUpperCase()} {item.tipo === 'APOIO' ? '(APOIO)' : ''}</Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <Text style={[styles.txtMotoristaVinculo, { flex: 1, marginTop: 0 }]}>
                            {item.motorista 
                                ? `${item.motorista.posicaoJoinha ? `${item.motorista.posicaoJoinha}º ` : ''}${item.motorista.nome}` 
                                : '❌ Sem Motorista / Vago'}
                        </Text>
                        
                        {!ehRotaVaga && (
                            <TouchableOpacity 
                                style={{ paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#fff1f0', borderRadius: 6, borderWidth: 1, borderColor: '#ffa39e' }}
                                onPress={() => {
                                    Alert.alert(
                                        "Desvincular Motorista",
                                        `Deseja remover *${item.motorista?.nome}* desta viagem e reabrir a vaga?`,
                                        [
                                            { text: "Não", style: "cancel" },
                                            { text: "Sim, Remover", style: "destructive", onPress: () => handleDesvincularRota(idFisicoRota) }
                                        ]
                                    );
                                }}
                            >
                                <Text style={{ color: '#cf1322', fontSize: 11, fontWeight: '700' }}>Remover</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {!!horarioDaRota && <Text style={{ fontSize: 12, color: '#555555', marginTop: 6, fontWeight: '600' }}>🕒 Horário: {horarioDaRota}</Text>}
                </View>

                {ehRotaVaga && (
                    <TouchableOpacity 
                        style={{ backgroundColor: '#fa8c16', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 5, marginBottom: 5 }}
                        onPress={() => {
                            setRotaEmEdicaoObjeto(item);
                            setFiltroNomeRotaInput('');
                            setSugestoesGlobaisRota([]);
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>⚡ SELECIONAR MOTORISTA PARA ESTA ROTA</Text>
                    </TouchableOpacity>
                )}
                
                <Text style={styles.txtTituloPassageiros}>Passageiros Vinculados:</Text>
                {item.passageiros?.map((pass: any, i: number) => (
                    <View key={pass.id_passageiro || i} style={styles.rowPassageiro}>
                        <Text style={styles.txtPassageiroItem}>{i + 1}️⃣ {pass.nome}</Text>
                        <Text style={styles.txtEnderecoItem}>Endereço: {pass.logradouro || 'Não informado'}{pass.numero ? `, ${pass.numero}` : ''}{pass.bairro ? ` - ${pass.bairro}` : ''}</Text>
                    </View>
                ))}
                {(!item.passageiros || item.passageiros.length === 0) && <Text style={styles.txtVazio}>Nenhum passageiro cadastrado.</Text>}
            </View>
        );
    };
    // Renderiza a interface padrão se nenhuma alocação em tela cheia estiver ativa
    if (!rotaEmEdicaoObjeto) {
        return (
            <React.Fragment>
                <StatusBar barStyle="dark-content" />
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    {abaAtiva === 'ESCALA' ? (
                        <FlatList 
                            data={renderizarFilaComLacunas()} 
                            keyExtractor={(item: IMotoristaEscala, index: number) => item.whatsAppLid ? `${item.whatsAppLid}_${index}` : String(item.id || index)} 
                            renderItem={renderItemEscala} 
                            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
                            showsVerticalScrollIndicator={false} 
                            ListHeaderComponent={
                                <View style={{ backgroundColor: '#fff', paddingTop: 20, marginBottom: 10, zIndex: 50 }}> 
                                    <View style={styles.headerSection}> 
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <Text style={styles.header}>Painel de Escalas</Text> 
                                            <TouchableOpacity 
                                                style={{ backgroundColor: '#f5f5f5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
                                                onPress={handleRedistribuirOriginal}
                                            >
                                                <Text style={{ color: '#0056b3', fontSize: 12, fontWeight: '700' }}>Reset Robô</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={styles.subHeader}>
                                            Fila do Dia: {dataExibicaoDinamica} {!!tipoDiaTexto ? `(${tipoDiaTexto.replace('_', ' ')})` : ''}
                                        </Text> 
                                        <View style={styles.linhaDestaque} /> 
                                    </View> 

                                    <View style={styles.tabContainer}> 
                                        <TouchableOpacity style={[styles.tabBotao, styles.tabBotaoAtivo]} onPress={() => setAbaAtiva('ESCALA')}> 
                                            <Text style={[styles.tabTexto, styles.tabTextoAtivo]}>Escala</Text> 
                                        </TouchableOpacity> 
                                        <TouchableOpacity style={styles.tabBotao} onPress={() => setAbaAtiva('TARDE')}> 
                                            <Text style={styles.tabTexto}>☀️ Tarde</Text> 
                                        </TouchableOpacity> 
                                        <TouchableOpacity style={styles.tabBotao} onPress={() => setAbaAtiva('MADRUGADA')}> 
                                            <Text style={styles.tabTexto}>🌙 Madrugada</Text> 
                                        </TouchableOpacity> 
                                    </View> 

                                    {/* CONTÊINER GERAL DO FORMULÁRIO DO TOPO COM CAMADAS AJUSTADAS */}
                                    <View style={styles.topFormWrapperMaster}>
                                        <View style={styles.miniFormularioFila}>
                                            <View style={{ flex: 2, position: 'relative' }}>
                                                <TextInput 
                                                    style={styles.miniInputNome}
                                                    placeholder="Digitar nome do motorista..."
                                                    placeholderTextColor="#999"
                                                    value={nomeBuscaInput}
                                                    onChangeText={lidarComMudancaTextoNome}
                                                />
                                                {!!buscandoMotoristas && (
                                                    <ActivityIndicator size="small" color={AZUL_MOOVE} style={{ position: 'absolute', right: 10, top: 10 }} />
                                                )}
                                            </View>
                                            <TextInput 
                                                style={[styles.miniInput, { flex: 1, textAlign: 'center' }]}
                                                placeholder="Posição"
                                                placeholderTextColor="#999"
                                                keyboardType="numeric"
                                                value={novaPosicaoInput}
                                                onChangeText={texto => setNovaPosicaoInput(texto)}
                                            />
                                            <TouchableOpacity style={styles.btnMiniFormAdicionar} onPress={handleInserirManual}>
                                                <Text style={styles.txtBtnMiniFormAdicionar}>+</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* CAIXA DE AUTOCOMPLETE FLUTUANTE DA ESCALA DO TOPO */}
                                        {sugestoesMotoristas.length > 0 && (
                                            <View style={styles.caixaSugestoes}>
                                                {sugestoesMotoristas.map((item, idx) => (
                                                    <TouchableOpacity 
                                                        key={item.whatsAppLid || String(idx)} 
                                                        style={styles.opcaoSugerida}
                                                        onPress={() => selecionarMotoristaSugerido(item)}
                                                    >
                                                        <Text style={styles.txtOpcaoSugerida}>👤 {item.nome}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                    {!!loading && <View style={{ marginVertical: 15 }}><ActivityIndicator size="large" color={AZUL_MOOVE} /></View>}
                                </View>
                            }
                            ListEmptyComponent={!loading ? <Text style={styles.empty}>Nenhum registro encontrado na escala.</Text> : null} 
                        />
                    ) : (
                        <FlatList 
                            data={listaRotas} 
                            keyExtractor={(item: IRotaAtribuida, index: number) => item.id ? `atrib_${item.id}_${index}` : `rot_${item.ordem || index}_${index}`} 
                            renderItem={renderItemRotas} 
                            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
                            showsVerticalScrollIndicator={false} 
                            ListHeaderComponent={
                                <View style={{ backgroundColor: '#fff', paddingTop: 20, marginBottom: 10 }}> 
                                    <View style={styles.headerSection}> 
                                        <Text style={styles.header}>Painel de Escalas</Text> 
                                        <Text style={styles.subHeader}>Execução do Turno: {dataExibicaoDinamica}</Text> 
                                        <View style={styles.linhaDestaque} /> 
                                    </View> 

                                    <View style={styles.tabContainer}> 
                                        <TouchableOpacity style={styles.tabBotao} onPress={() => setAbaAtiva('ESCALA')}> 
                                            <Text style={styles.tabTexto}>Escala</Text> 
                                        </TouchableOpacity> 
                                        <TouchableOpacity style={[styles.tabBotao, abaAtiva === 'TARDE' && styles.tabBotaoAtivo]} onPress={() => setAbaAtiva('TARDE')}> 
                                            <Text style={[styles.tabTexto, abaAtiva === 'TARDE' && styles.tabTextoAtivo]}>☀️ Tarde</Text> 
                                        </TouchableOpacity> 
                                        <TouchableOpacity style={[styles.tabBotao, abaAtiva === 'MADRUGADA' && styles.tabBotaoAtivo]} onPress={() => setAbaAtiva('MADRUGADA')}> 
                                            <Text style={[styles.tabTexto, abaAtiva === 'MADRUGADA' && styles.tabTextoAtivo]}>🌙 Madrugada</Text> 
                                        </TouchableOpacity> 
                                    </View> 
                                    {!!loading && <View style={{ marginVertical: 15 }}><ActivityIndicator size="large" color={AZUL_MOOVE} /></View>}
                                </View>
                            }
                            ListEmptyComponent={!loading ? <Text style={styles.empty}>Nenhuma rota atribuída para este período.</Text> : null} 
                        />
                    )}
                </View>
            </React.Fragment>
        );
    }

    const idFisicoRotaAlvo = Number((rotaEmEdicaoObjeto as any).id_rota || rotaEmEdicaoObjeto.id);
    const identificadorOrdem = (rotaEmEdicaoObjeto.ordem || '').toUpperCase();
    return (
        <React.Fragment>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.container, { paddingHorizontal: 20, paddingTop: 30 }]}>
                
                <View style={styles.headerSectionCustom}>
                    <Text style={{ color: '#1a1a1a', fontSize: 20, fontWeight: '800' }}>Atribuição Manual Direta</Text>
                    <Text style={{ color: '#555555', fontSize: 13, marginTop: 4, fontWeight: '600' }}>
                        Destino: {identificadorOrdem} {rotaEmEdicaoObjeto.tipo === 'APOIO' ? '(VAGA DO APOIO)' : ''}
                    </Text>
                    <View style={[styles.linhaDestaque, { marginTop: 8 }]} />
                </View>

                <View style={styles.searchContainerMaster}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 }}>Digite o nome para buscar no banco de dados:</Text>
                    <TextInput
                        style={{ backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', fontSize: 15, color: '#333' }}
                        placeholder="Pesquisar por nome (mínimo 3 letras)..."
                        placeholderTextColor="#999"
                        value={filtroNomeRotaInput}
                        onChangeText={buscarMotoristasParaRota}
                        autoFocus
                    />

                    {filtroNomeRotaInput.trim().length >= 3 && sugestoesGlobaisRota && sugestoesGlobaisRota.length > 0 && (
                        <View style={styles.caixaSugestoes}>
                            <FlatList
                                data={sugestoesGlobaisRota}
                                keyboardShouldPersistTaps="handled"
                                keyExtractor={(mot: any, idx: number) => mot.whatsAppLid ? `${mot.whatsAppLid}_${idx}` : String(idx)}
                                style={{ maxHeight: 250 }}
                                renderItem={({ item: mot }) => {
                                    const esRestritoRota = mot.podeFazerRota === false;
                                    return (
                                        <TouchableOpacity 
                                            style={styles.opcaoSugerida}
                                            disabled={esRestritoRota}
                                            onPress={() => {
                                                Alert.alert(
                                                    "Confirmar Vínculo",
                                                    `Deseja alocar *${mot.nome}* na rota extra *${identificadorOrdem}*?`,
                                                    [
                                                        { text: "Cancelar", style: "cancel" },
                                                        { 
                                                            text: "Sim, Vincular", 
                                                            onPress: async () => {
                                                                setRotaEmEdicaoObjeto(null);
                                                                await handleForcarRotaApoio(mot.whatsAppLid, idFisicoRotaAlvo);
                                                            } 
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Text style={[styles.txtOpcaoSugerida, { color: esRestritoRota ? '#aaa' : '#333' }]}>
                                                👤 {mot.nome} {esRestritoRota ? '(SÓ PLANTÃO)' : ''}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    )}
                </View>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {filtroNomeRotaInput.trim().length >= 3 && sugestoesGlobaisRota.length === 0 ? (
                        <Text style={{ color: '#999', textAlign: 'center', fontSize: 14, fontStyle: 'italic' }}>
                            Nenhum motorista correspondente encontrado no banco.
                        </Text>
                    ) : filtroNomeRotaInput.trim().length < 3 ? (
                        <Text style={{ color: '#999', textAlign: 'center', fontSize: 14, fontStyle: 'italic' }}>
                            Digite 3 ou mais letras acima para iniciar o cruzamento de dados.
                        </Text>
                    ) : null}
                </View>

                <TouchableOpacity 
                    style={{ backgroundColor: '#f5f5f5', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' }}
                    onPress={() => {
                        setRotaEmEdicaoObjeto(null);
                        Keyboard.dismiss();
                    }}
                >
                    <Text style={{ color: '#cf1322', fontSize: 13, fontWeight: '800' }}>↩️ FECHAR BUSCA AND VOLTAR</Text>
                </TouchableOpacity>
            </View>
        </React.Fragment>
    );
}
const styles = StyleSheet.create({ 
    container: { flex: 1, backgroundColor: '#fff' }, 
    headerSection: { marginBottom: 15 }, 
    headerSectionCustom: { marginBottom: 20, zIndex: 10, elevation: 10 }, 
    header: { color: '#1a1a1a', fontSize: 26, fontWeight: '800' }, 
    subHeader: { color: '#555555', fontSize: 14, marginTop: 4, fontWeight: '600' }, 
    linhaDestaque: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 12, borderRadius: 2 }, 
    centro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }, 
    tabContainer: { flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 5, borderRadius: 12, marginBottom: 20 }, 
    tabBotao: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, 
    tabBotaoAtivo: { backgroundColor: '#0056b3' }, 
    tabTexto: { color: '#555555', fontSize: 13, fontWeight: '700' }, 
    tabTextoAtivo: { color: '#fff' }, 
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }, 
    cardPenalizado: { backgroundColor: '#fff1f0', borderColor: '#ffa39e' }, 
    cardApoio: { backgroundColor: '#fffbe6', borderColor: '#ffe58f' }, 
    posicaoContainer: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#f0f7ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 }, 
    posicaoTexto: { color: '#0056b3', fontSize: 16, fontWeight: '800' }, 
    infoContainer: { flex: 1 }, 
    nome: { color: '#1a1a1a', fontSize: 16, fontWeight: '700' }, 
    categoriaTexto: { fontSize: 12, fontWeight: '800', marginTop: 4, textTransform: 'uppercase' }, 
    txtAlerta: { color: '#cf1322', fontSize: 10, fontWeight: '800', marginTop: 6 }, 
    cardRota: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#f0f0f0', elevation: 2 }, 
    cardRotaApoioBackground: { backgroundColor: '#fffbe6', borderColor: '#ffe58f' }, 
    headerCardRota: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10, marginBottom: 10 }, 
    txtNomeRota: { fontSize: 14, fontWeight: '800', color: '#1a1a1a' }, 
    txtMotoristaVinculo: { fontSize: 13, fontWeight: '700', color: '#0056b3', marginTop: 4 }, 
    txtTituloPassageiros: { fontSize: 11, fontWeight: '800', color: '#999', marginBottom: 8, textTransform: 'uppercase' }, 
    rowPassageiro: { marginBottom: 10, paddingLeft: 4 }, 
    txtPassageiroItem: { fontSize: 14, fontWeight: '700', color: '#333' }, 
    txtEnderecoItem: { fontSize: 12, color: '#555555', marginTop: 2, paddingLeft: 18 }, 
    txtVazio: { fontSize: 12, color: '#999', fontStyle: 'italic' }, 
    empty: { color: '#999', textAlign: 'center', marginTop: 40, fontSize: 16 },
    controlesFila: { flexDirection: 'row', alignItems: 'center' },
    btnSeta: { padding: 6, backgroundColor: '#f5f5f5', borderRadius: 8, marginHorizontal: 2, width: 28, alignItems: 'center' },
    txtSeta: { fontSize: 11, fontWeight: 'bold', color: '#333' },
    
    // 🔥 CAMADAS CORRIGIDAS: Força o invólucro do formulário e as sugestões flutuantes a ficarem por cima do pátio de escalas
    topFormWrapperMaster: { position: 'relative', zIndex: 100, elevation: 100 },
    miniFormularioFila: { flexDirection: 'row', padding: 10, backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 5, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
    miniInput: { backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 13, marginRight: 5, color: '#333' },
    miniInputNome: { backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 13, marginRight: 5, color: '#333', height: 38 },
    btnMiniFormAdicionar: { backgroundColor: '#0056b3', width: 36, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    txtBtnMiniFormAdicionar: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    
    searchContainerMaster: { marginBottom: 15, zIndex: 999, elevation: 999, position: 'relative' },
    caixaSugestoes: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', position: 'absolute', top: 55, width: '100%', paddingHorizontal: 5, zIndex: 1000, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5 },
    opcaoSugerida: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    txtOpcaoSugerida: { fontSize: 14, color: '#333', fontWeight: '600' }
});