export namespace SGPWeb {
  export interface APIResponseBody<T> {
    retorno: {
      status_processamento: number;
      status: string;
      total: number;
      numero_paginas: number;
      pagina: number;
      objetos: T;
    };
  }

  export interface ApiObjetosRastroResponse
    extends APIResponseBody<Postagem[]> {}

  export enum SearchExportType {
    XLS = "xls",
    CSV = "csv",
  }

  export interface Postagem {
    objeto: string;
    conteudo: string;
    plp: string;
    status: string;
    data_hora_status: string;
    data_envio: string;
    data_previsao: string;
    prazo: string;
    departamento: string;
    servico_correios: string;
    destinatario: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    empresa: string;
    email_destino: string;
    telefone_destino: string;
    produto: string;
    altura: string;
    largura: string;
    comprimento: string;
    peso: string;
    valor_declarado: string;
    observacao: string | null;
    os: string | null;
    nota_fiscal: string | null;
    remetente: string;
    cep_remetente: string;
    endereco_remetente: string;
    numero_remetente: string;
    complemento_remetente: string;
    bairro_remetente: string;
    cidade_remetente: string;
    uf_remetente: string;
    comentario: string | null;
    valor: string;
    integracao: string | null;
    codContrato: string;
  }
}
