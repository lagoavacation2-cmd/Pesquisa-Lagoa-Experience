export interface NpsResponse {
  id?: string;
  created_at?: string;
  nome: string;
  telefone: string;
  email?: string;
  hotel: string;
  periodo_hospedagem?: string;
  satisfacao_hospedagem: number;
  atendimento_hotel: number;
  atendimento_parque: number;
  lazer_estrutura: number;
  apresentacao_produto: number;
  clareza_consultor: number;
  expectativa_entregue: number;
  nota_nps: number;
  classificacao_nps: 'Detrator' | 'Neutro' | 'Promotor';
  comentario_final?: string;
  origem: string;
  user_agent?: string;
  dispositivo?: string;
}

export interface DashboardStats {
  totalResponses: number;
  avgNps: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  satisfactionRate: number;
  avgHospedagem: number;
  avgAtendimentoHotel: number;
  avgAtendimentoParque: number;
  avgApresentacao: number;
}
