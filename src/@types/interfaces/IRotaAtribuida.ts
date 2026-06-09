import IPassageiroEscala from "./IPassageiroEscala";

interface IRotaAtribuida {
    id: number;
    nomeRota: string;
    rota: string;
    ordem: string;
    horario: string;
    tipo: "COMUM" | "APOIO" | "PLANTAO";
    motorista: { id: number; nome: string; posicaoJoinha: number; } | null;
    empresas: Array<{ id: number; nome: string; icone: string | null; }>;
    passageiros: IPassageiroEscala[];
}

export default IRotaAtribuida;