export interface User {
  id: number
  email: string
  nome?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Moto {
  id: number
  apelido: string
  modelo: string
  ano: number
  km_inicial: number
  media_diaria_km: number
  data_referencia: string
}

export interface MotoResponse {
  moto: Moto
  km_atual: number
}

export interface ManutencaoTipo {
  id: number
  nome: string
  intervalo_km: number
  ativo: boolean
}

export interface ManutencaoRealizada {
  id: number
  tipo_manutencao_id: number
  tipo?: ManutencaoTipo
  data_realizacao: string
  km_no_momento: number
  valor_gasto: number
  observacao?: string
}

export interface ManutencaoStatusItem {
  tipo: ManutencaoTipo
  ultimaManutencao: ManutencaoRealizada | null
  km_proxima: number
  km_restante: number
  data_estimada: string
  alerta_ativo: boolean
  vencida: boolean
  km_antecedencia: number
  notificacao_ativa: boolean
}

export interface ManutencaoStatusResponse {
  moto: Moto
  km_atual: number
  statusList: ManutencaoStatusItem[]
}

export interface GastosPorTipo {
  nome: string
  total: number
  quantidade: number
}

export interface GastosMensal {
  mes: string
  total: number
  quantidade: number
}

export interface GastosResumoResponse {
  total_geral: number
  total_periodo: number
  periodo_meses: number
  por_tipo: GastosPorTipo[]
  mensal: GastosMensal[]
  ultima_manutencao: ManutencaoRealizada | null
}

export interface AlertaConfig {
  tipo_manutencao_id: number
  tipo?: ManutencaoTipo
  km_antecedencia: number
  notificacao_ativa: boolean
}
