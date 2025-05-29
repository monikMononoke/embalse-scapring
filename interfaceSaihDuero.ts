export interface InterfaceSaihDuero {
  province: string;
  name: string;
  capacityHm3: number;
  currentHm3: number;
  currentPercentage: number;
  lastYearHm3: number;
  lastTenYearsHm3: number;
  volumeVariation: number;
  rainfallLByM2: number;
  averageEntrancem3ByS: number;
  averageExitm3ByS: number;
  rainfallYearLbym2: number;
}

export interface ReservoirsByProvince {
  [province: string]: InterfaceSaihDuero[];
}
