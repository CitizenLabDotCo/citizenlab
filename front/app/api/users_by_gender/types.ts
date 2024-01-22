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
