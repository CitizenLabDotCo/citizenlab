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

export type UsersByBirthyearResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key: string]: number;
    };
  };
};
