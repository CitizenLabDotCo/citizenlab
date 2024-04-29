export interface Props {
  customFieldId?: string;
  projectId: string | undefined;
  startAt?: string;
  endAt?: string | null;
}

export type Data = [Record<string, number>];
