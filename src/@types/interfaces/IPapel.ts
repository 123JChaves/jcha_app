export enum RoleEnum {
    ADMIN = 'admin',
    USER = 'user'
}

export interface IPermissao {
    id: number;
    nome: string;
}

export interface IPapel {
    id: number;
    nome: RoleEnum;
    permissoes?: IPermissao[];
}

export default IPapel;