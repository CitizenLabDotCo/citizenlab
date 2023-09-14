import { Keys } from 'utils/cl-react-query/types';
import moderationsCountKeys from './keys';

export type ModerationsCountKeys = Keys<typeof moderationsCountKeys>;

export interface IModerationsCount {
  data: {
    type: 'moderations_count';
    attributes: { count: number };
  };
}
