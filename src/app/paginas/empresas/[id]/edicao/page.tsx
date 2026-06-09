import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import instancia from '../../../../../service/api';
import IImageFile from '../../../../../@types/interfaces/IImageFile';

export default function EditarEmpresa() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    
    // Captura o ID de forma segura
    const parametros = route.params as { id: number };
    const id = parametros?.id;

    const [nome, setNome] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [imagem, setImagem] = useState<any>(null);
    const [carregando, setCarregando] = useState(true);
    const [estaSalvando, setEstaSalvando] = useState(false);

    const AZUL_MOOVE = "#0056b3";
    const BASE_URL_IMAGENS = process.env.EXPO_PUBLIC_URL_IMAGEM;

    useEffect(() => {
        const buscarDados = async () => {
            if (!id) {
                Alert.alert("Erro", "ID da empresa não identificado.");
                navigation.goBack();
                return;
            }

            try {
                // Chamada para a rota: /empresa/:id
                const response = await instancia.get(`/empresa/${id}`);
                const dados = response.data;

                setNome(dados.nome);
                setCnpj(formatarCNPJ(dados.cnpj));
                
                if (dados.logo) {
                    setImagem({ 
                        uri: `${BASE_URL_IMAGENS}/${dados.logo}`, 
                        persistido: true 
                    });
                }
            } catch (error) {
                Alert.alert("Erro", "Falha ao carregar dados da empresa.");
                navigation.goBack();
            } finally {
                setCarregando(false);
            }
        };
        buscarDados();
    }, [id]);

    const formatarCNPJ = (text: string) => {
        const limpo = text.replace(/\D/g, '');
        return limpo
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .substring(0, 18);
    };

    const selecionarImagem = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setImagem(result.assets[0]);
        }
    };

    const handleSalvar = async () => {
        if (!nome || !cnpj) {
            Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
            return;
        }

        setEstaSalvando(true);
        const formData = new FormData();
        formData.append('nome', nome.trim());
        formData.append('cnpj', cnpj.replace(/\D/g, ''));

        if (imagem && !imagem.persistido) {
            const arquivo: any = {
                uri: imagem.uri,
                name: imagem.fileName ?? `logo_${Date.now()}.jpg`,
                type: imagem.mimeType ?? 'image/jpeg',
            };
            formData.append('logo', arquivo);
        }

        try {
            await instancia.put(`/empresa/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert("Sucesso", "Empresa atualizada!");
            navigation.goBack();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao salvar.";
            Alert.alert("Erro", msg);
        } finally {
            setEstaSalvando(false);
        }
    };

    if (carregando) {
        return (
            <View style={styles.containerCentralizado}>
                <ActivityIndicator size="large" color={AZUL_MOOVE} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.tela}
        >
            <StatusBar barStyle="dark-content" />
            <View style={[styles.areaPrincipal, { paddingTop: insets.top }]}>
                <ScrollView contentContainerStyle={styles.conteudoScroll} keyboardShouldPersistTaps="always">
                    
                    <View style={styles.blocoCabecalho}>
                        <Text style={styles.textoTitulo}>Editar Empresa</Text>
                        <Text style={styles.textoSubtitulo}>Gestão de unidades Moove</Text>
                        <View style={styles.detalheLinha} />
                    </View>

                    <Text style={styles.rotuloCampo}>Dados Cadastrais</Text>
                    
                    <TextInput 
                        style={styles.campoInput} 
                        placeholder="Nome" 
                        value={nome} 
                        onChangeText={setNome}
                        placeholderTextColor="#999"
                    />

                    <TextInput 
                        style={styles.campoInput} 
                        placeholder="CNPJ" 
                        value={cnpj} 
                        onChangeText={(t) => setCnpj(formatarCNPJ(t))} 
                        keyboardType="numeric" 
                        maxLength={18}
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.rotuloCampo}>Identidade Visual</Text>
                    <TouchableOpacity style={styles.molduraImagem} onPress={selecionarImagem}>
                        {imagem ? (
                            <Image source={{ uri: imagem.uri }} style={styles.previewLogo} />
                        ) : (
                            <View style={styles.placeholderImagem}>
                                <MaterialCommunityIcons name="image-plus" size={40} color="#ccc" />
                                <Text style={styles.textoBotaoImagem}>Alterar Logo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.botaoAcao, { backgroundColor: estaSalvando ? '#ccc' : AZUL_MOOVE }]} 
                        onPress={handleSalvar}
                        disabled={estaSalvando}
                    >
                        {estaSalvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotaoAcao}>SALVAR ALTERAÇÕES</Text>}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: '#fff' },
    containerCentralizado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    areaPrincipal: { flex: 1 },
    conteudoScroll: { padding: 25, paddingBottom: 50 },
    blocoCabecalho: { marginBottom: 30 },
    textoTitulo: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
    textoSubtitulo: { fontSize: 14, color: '#666', marginTop: 4 },
    detalheLinha: { height: 4, width: 35, backgroundColor: '#0056b3', marginTop: 12, borderRadius: 2 },
    rotuloCampo: { fontSize: 11, fontWeight: '700', color: '#999', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    campoInput: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee', color: '#1a1a1a', fontSize: 15 },
    molduraImagem: { backgroundColor: '#f8f9fa', height: 180, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
    placeholderImagem: { alignItems: 'center' },
    textoBotaoImagem: { color: '#aaa', marginTop: 8, fontSize: 13, fontWeight: '600' },
    previewLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
    botaoAcao: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    textoBotaoAcao: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});