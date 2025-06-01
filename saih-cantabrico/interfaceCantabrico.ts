export interface Cantabrico {
  id: number;
  rio: string;
  embalse: string;
  nivel: number;
  nivelMaximo: number;
  resguardoNivel: number;
  volumen: number;
  volumenTotalHm3: number;
  ResguardoVolumenHm3: number;
  porcentajeLLenado: number;
  husoMax: number;
  husoMin: number;
  fechaActualizacion: string;
}

export interface ZonaHidrologica {
  [name: string]: Cantabrico[];
}
