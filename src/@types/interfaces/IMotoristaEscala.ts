interface IMotoristaEscala {
  id: number;
  posicao: number;
  categoria: "PLANTAO" | "ROTA" | "APOIO" | "BACKUP" | "LIVRE";
  isPenalizado: boolean;
  whatsAppLid: string;
  isApoioManual?: boolean;
  chaveUnica: string; // Gerada dinamicamente para performance do FlatList
  motorista?: {
    id: number;
    nome: string;
    podeFazerRota?: boolean;
  };
}

export default IMotoristaEscala;