import { CandidateInfo } from '../types';

export const CANDIDATOS: Readonly<Record<'13' | '22', Readonly<CandidateInfo>>> = Object.freeze({
  '13': Object.freeze({
    numero: '13',
    nome: 'LULA',
    nomeCompleto: 'Luiz Inácio Lula da Silva',
    partido: 'PT',
    sigla: 'PT - PARTIDO DOS TRABALHADORES',
    vice: 'Geraldo Alckmin',
    foto: '/candidatos/lula.jpg',
    corPrincipal: '#dc2626',
    corSecundaria: '#b91c1c',
  }),
  '22': Object.freeze({
    numero: '22',
    nome: 'FLÁVIO BOLSONARO',
    nomeCompleto: 'Flávio Nantes Bolsonaro',
    partido: 'PL',
    sigla: 'PL - PARTIDO LIBERAL',
    vice: 'Alfredo Gaspar',
    foto: '/candidatos/flavio.jpg',
    corPrincipal: '#2563eb',
    corSecundaria: '#1d4ed8',
  }),
});
