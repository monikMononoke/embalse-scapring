export interface ReservoirData {
  embalse: string;
  capacidadHm3: number;
  almacenadoHm3: number;
  porcentaje: number;
}

export interface ReservoirsByProvince {
  [name: string]: ReservoirData[];
}
