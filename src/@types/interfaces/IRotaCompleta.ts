import IEmpresa from "./IEmpresa";
import IPassageiro from "./IPassageiro";

interface IRotaCompleta {
  id: number;
  nome: string;
  ordem: string;
  tipo_rota: string;
  horario: string;
  passageiros: IPassageiro[];
  empresas: IEmpresa[];
}

export default IRotaCompleta;