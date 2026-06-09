// src/types/Motorista.ts
interface IMotorista {
  id: number;
  nome: string;
  telefoneWhatsApp: string;
  ativo: boolean;
  dataDeRegistro: string; // Vem como string ISO da API
  dataDeEdicao: string;
};

export default IMotorista;