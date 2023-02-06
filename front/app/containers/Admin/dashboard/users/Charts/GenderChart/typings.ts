export interface QueryParameters {
  startAt: string | undefined | null;
  endAt: string | null;
  currentGroupFilter?: string;
  projectId?: string;
}

export type GenderSerie = {
  name: string;
  value: number;
  code: string;
  percentage: number;
}[];
