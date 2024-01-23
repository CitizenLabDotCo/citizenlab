import { GenderOption } from 'api/users_by_gender/types';

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

export type UsersByGenderResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key in GenderOption]: number;
    };
  };
};
