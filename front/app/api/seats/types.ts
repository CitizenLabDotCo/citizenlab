import { Keys } from 'utils/cl-react-query/types';
import seatsKeys from './keys';

export type SeatsKeys = Keys<typeof seatsKeys>;

export interface SeatsType {
  data: {
    type: 'seats';
    attributes: {
      admins_number: number;
      project_moderators_number: number;
    };
  };
}
