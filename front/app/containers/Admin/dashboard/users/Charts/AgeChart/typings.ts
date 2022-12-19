export interface QueryParameters {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter?: string;
  projectId?: string;
}

export type AgeSerie = {
  name: string;
  value: number;
}[];
