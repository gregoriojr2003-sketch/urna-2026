// Brazilian geographical database for electoral regionalization
// All 5 Regiões, 27 Unidades Federativas (UFs), and major municípios / capitais

export type RegiaoNome = 'Sudeste' | 'Nordeste' | 'Sul' | 'Norte' | 'Centro-Oeste';

export interface RegiaoInfo {
  nome: RegiaoNome;
  sigla: string;
  estados: string[];
  descricao: string;
}

export interface EstadoInfo {
  uf: string;
  nome: string;
  regiao: RegiaoNome;
  capital: string;
  eleitoradoPeso: number; // approximate weight in national electorate (%)
}

export interface MunicipioInfo {
  nome: string;
  uf: string;
  regiao: RegiaoNome;
  isCapital: boolean;
}

export const REGIOES: RegiaoInfo[] = [
  {
    nome: 'Sudeste',
    sigla: 'SE',
    estados: ['SP', 'RJ', 'MG', 'ES'],
    descricao: 'Maior colégio eleitoral do país (~43% dos eleitores)',
  },
  {
    nome: 'Nordeste',
    sigla: 'NE',
    estados: ['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'AL', 'PI', 'SE'],
    descricao: 'Segundo maior colégio eleitoral (~27% dos eleitores)',
  },
  {
    nome: 'Sul',
    sigla: 'S',
    estados: ['PR', 'SC', 'RS'],
    descricao: 'Região Sul (~15% dos eleitores)',
  },
  {
    nome: 'Norte',
    sigla: 'N',
    estados: ['PA', 'AM', 'RO', 'TO', 'AC', 'AP', 'RR'],
    descricao: 'Região Norte (~8% dos eleitores)',
  },
  {
    nome: 'Centro-Oeste',
    sigla: 'CO',
    estados: ['GO', 'MT', 'MS', 'DF'],
    descricao: 'Região Centro-Oeste e Distrito Federal (~7% dos eleitores)',
  },
];

export const ESTADOS: EstadoInfo[] = [
  // Sudeste
  { uf: 'SP', nome: 'São Paulo', regiao: 'Sudeste', capital: 'São Paulo', eleitoradoPeso: 22.1 },
  { uf: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste', capital: 'Belo Horizonte', eleitoradoPeso: 10.4 },
  { uf: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste', capital: 'Rio de Janeiro', eleitoradoPeso: 8.2 },
  { uf: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste', capital: 'Vitória', eleitoradoPeso: 1.9 },

  // Nordeste
  { uf: 'BA', nome: 'Bahia', regiao: 'Nordeste', capital: 'Salvador', eleitoradoPeso: 7.1 },
  { uf: 'PE', nome: 'Pernambuco', regiao: 'Nordeste', capital: 'Recife', eleitoradoPeso: 4.5 },
  { uf: 'CE', nome: 'Ceará', regiao: 'Nordeste', capital: 'Fortaleza', eleitoradoPeso: 4.3 },
  { uf: 'MA', nome: 'Maranhão', regiao: 'Nordeste', capital: 'São Luís', eleitoradoPeso: 3.3 },
  { uf: 'PB', nome: 'Paraíba', regiao: 'Nordeste', capital: 'João Pessoa', eleitoradoPeso: 2.0 },
  { uf: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste', capital: 'Natal', eleitoradoPeso: 1.7 },
  { uf: 'AL', nome: 'Alagoas', regiao: 'Nordeste', capital: 'Maceió', eleitoradoPeso: 1.5 },
  { uf: 'PI', nome: 'Piauí', regiao: 'Nordeste', capital: 'Teresina', eleitoradoPeso: 1.7 },
  { uf: 'SE', nome: 'Sergipe', regiao: 'Nordeste', capital: 'Aracaju', eleitoradoPeso: 1.1 },

  // Sul
  { uf: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul', capital: 'Porto Alegre', eleitoradoPeso: 5.5 },
  { uf: 'PR', nome: 'Paraná', regiao: 'Sul', capital: 'Curitiba', eleitoradoPeso: 5.4 },
  { uf: 'SC', nome: 'Santa Catarina', regiao: 'Sul', capital: 'Florianópolis', eleitoradoPeso: 3.6 },

  // Norte
  { uf: 'PA', nome: 'Pará', regiao: 'Norte', capital: 'Belém', eleitoradoPeso: 3.9 },
  { uf: 'AM', nome: 'Amazonas', regiao: 'Norte', capital: 'Manaus', eleitoradoPeso: 1.7 },
  { uf: 'RO', nome: 'Rondônia', regiao: 'Norte', capital: 'Porto Velho', eleitoradoPeso: 0.8 },
  { uf: 'TO', nome: 'Tocantins', regiao: 'Norte', capital: 'Palmas', eleitoradoPeso: 0.7 },
  { uf: 'AC', nome: 'Acre', regiao: 'Norte', capital: 'Rio Branco', eleitoradoPeso: 0.4 },
  { uf: 'AP', nome: 'Amapá', regiao: 'Norte', capital: 'Macapá', eleitoradoPeso: 0.4 },
  { uf: 'RR', nome: 'Roraima', regiao: 'Norte', capital: 'Boa Vista', eleitoradoPeso: 0.2 },

  // Centro-Oeste
  { uf: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste', capital: 'Goiânia', eleitoradoPeso: 3.1 },
  { uf: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste', capital: 'Cuiabá', eleitoradoPeso: 1.6 },
  { uf: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste', capital: 'Campo Grande', eleitoradoPeso: 1.3 },
  { uf: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste', capital: 'Brasília', eleitoradoPeso: 1.5 },
];

export const MUNICIPIOS_DESTAQUE: Record<string, string[]> = {
  SP: ['São Paulo', 'Campinas', 'Guarulhos', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Santos', 'Sorocaba'],
  RJ: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba'],
  ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna'],
  PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista'],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
  MA: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias'],
  PB: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos'],
  RN: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante'],
  AL: ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios'],
  PI: ['Teresina', 'Parnaíba', 'Picos'],
  SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Itajaí'],
  PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas'],
  AM: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru'],
  RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes'],
  TO: ['Palmas', 'Araguaína', 'Gurupi'],
  AC: ['Rio Branco', 'Cruzeiro do Sul'],
  AP: ['Macapá', 'Santana'],
  RR: ['Boa Vista', 'Rorainópolis'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
  MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop'],
  MS: ['Campo Grande', 'Dourados', 'Três Lagoas'],
  DF: ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Águas Claras'],
};

// Map each UF to its Region name
export const UF_TO_REGIAO: Record<string, RegiaoNome> = {};
ESTADOS.forEach((e) => {
  UF_TO_REGIAO[e.uf] = e.regiao;
});

// Deterministic location resolver for ballots lacking explicit location
export function resolveVoteLocation(
  voteId: string,
  voterSessionId?: string,
  explicitUf?: string,
  explicitMunicipio?: string
): { uf: string; estadoNome: string; regiao: RegiaoNome; municipio: string } {
  // If vote already has an explicit location
  if (explicitUf && UF_TO_REGIAO[explicitUf]) {
    const estado = ESTADOS.find((e) => e.uf === explicitUf)!;
    const municipio = explicitMunicipio || estado.capital;
    return {
      uf: estado.uf,
      estadoNome: estado.nome,
      regiao: estado.regiao,
      municipio,
    };
  }

  // Consistent hashing based on voterSessionId or voteId
  const seed = voterSessionId || voteId || 'default_seed_urna';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  // Cumulative distribution based on realistic Brazilian electorate weights
  const totalWeight = ESTADOS.reduce((acc, cur) => acc + cur.eleitoradoPeso, 0);
  const target = (posHash % 10000) / 10000 * totalWeight;

  let accumulated = 0;
  let selectedEstado = ESTADOS[0];
  for (const estado of ESTADOS) {
    accumulated += estado.eleitoradoPeso;
    if (target <= accumulated) {
      selectedEstado = estado;
      break;
    }
  }

  // Select municipality within state
  const cities = MUNICIPIOS_DESTAQUE[selectedEstado.uf] || [selectedEstado.capital];
  const cityIndex = (posHash >> 3) % cities.length;
  const municipio = cities[cityIndex] || selectedEstado.capital;

  return {
    uf: selectedEstado.uf,
    estadoNome: selectedEstado.nome,
    regiao: selectedEstado.regiao,
    municipio,
  };
}
