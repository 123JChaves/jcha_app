interface IPassageiro {
  id?: number;
  nome: string;
  telefoneWhatsApp: string;
  ativo: boolean;
  solicitacao?: boolean;
  endereco: {
    id?: number
    nome: string,
    numero: number,
    bairro: {
      id?: number,
      nome: string,
      cidade: {
        id?: number,
        nome: string,
        estado: {
          id?: number,
          nome: string,
          pais: {
            id?: number,
            nome: string,
          }
        }
      }
    }
  };
  empresa?: {
    id?: number;
    nome: string;
  };
};
export default IPassageiro;