import { IPapel } from "./IPapel";

export interface IPermissao {
    id: number;
    nome: string;
    papeis?: IPapel[];
}

export default IPermissao;