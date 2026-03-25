export interface AreaStatus {
  nombre: string;
  completada: boolean;
  fechaCumplimiento?: string;
}

export interface Expediente {
  id: string;
  numero: string;
  asunto: string;
  areas: AreaStatus[];
  fechaInicio: string;
  fechaVencimiento: string;
  observacion?: string;
}

export type StatusColor = 'green' | 'amber' | 'red';

export interface ReportStats {
  total: number;
  alDia: number;
  proximas: number;
  retrasadas: number;
}
