export type CandidateId = '13' | '22' | 'branco' | 'nulo';

export interface CandidateInfo {
  numero: string;
  nome: string;
  nomeCompleto: string;
  partido: string;
  sigla: string;
  vice: string;
  foto: string;
  corPrincipal: string;
  corSecundaria: string;
}

export interface VoteTally {
  lula: number;
  flavio: number;
  branco: number;
  nulo: number;
  total: number;
  updatedAt: string;
}

export interface IndividualVote {
  id?: string;
  candidate: CandidateId;
  candidateName: string;
  voterSessionId: string;
  timestamp: string;
  uf?: string;
  regiao?: string;
  municipio?: string;
}

export interface VoterLocation {
  uf: string;
  regiao: string;
  municipio: string;
}

export interface VoterReceipt {
  codigoEleitoral: string;
  timestamp: string;
  zona: string;
  secao: string;
  autenticacao: string;
  votoComputado: boolean;
}
