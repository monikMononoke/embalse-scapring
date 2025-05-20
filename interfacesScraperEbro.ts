export interface ReservoirData {
  name: string;
  lastHour: number;
  today: number;
  twentyFourHours: number;
  yesterday: number;
  thisMonth: number;
  thisYear: number;
  province: string;
  riverZone: string;
}

export interface ReservoirCollection {
  [reservoir: string]: ReservoirData[];
}
