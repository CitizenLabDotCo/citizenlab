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

export interface GenderAggregation {
  ['dimension_user_custom_field_values.value']: GenderOption | null;
  count_dimension_user_custom_field_values_dimension_user_id: number;
}

export interface IUsersByGender {
  data: {
    type: 'users_by_gender';
    attributes: GenderAggregation[];
  };
}
