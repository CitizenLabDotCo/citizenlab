import { Keys } from 'utils/cl-react-query/types';
import usersByGenderKeys from './keys';

export type UsersByGenderKeys = Keys<typeof usersByGenderKeys>;

export const genderOptions = [
  'male',
  'female',
  'unspecified',
  '_blank',
] as const;

export type GenderOption = (typeof genderOptions)[number];

export interface IUsersByGender {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key in GenderOption]: number;
    };
  };
}
