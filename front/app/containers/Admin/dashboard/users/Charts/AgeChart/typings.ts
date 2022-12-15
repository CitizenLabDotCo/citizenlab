export interface QueryParameters {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
}

export type AgeSerie = {
  name: string;
  value: number;
}[];
