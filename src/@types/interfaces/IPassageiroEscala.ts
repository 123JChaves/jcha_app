interface IPassageiroEscala {
    id_passageiro: number;
    nome: string;
    telefoneWhatsApp: string;
    ordem_na_rota: number;
    bairro: string | null;
    logradouro: string | null; 
    numero: string | null;
}

export default IPassageiroEscala;