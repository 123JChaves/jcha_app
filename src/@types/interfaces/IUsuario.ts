export enum RoleEnum {
    ADMIN = 'admin',
    USER = 'user'
}

export interface IPapel {
    id: number;
    nome: RoleEnum;
    // Caso precise expor as permissões no Front-end, remova o comentário abaixo:
    // permissoes?: any[]; 
}

export interface IUsuario {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    senha?: string;
    telefoneWhatsApp?: string;  
    whatsappLid?: string;       
    papeis?: IPapel[];          
    dataDeRegistro: Date;
    dataDeEdicao: Date;
}

export default IUsuario;