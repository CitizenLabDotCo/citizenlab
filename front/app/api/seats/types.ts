import { Keys } from 'utils/cl-react-query/types';
import seatsKeys from './keys';

export type SeatsKeys = Keys<typeof seatsKeys>;
export type TSeatType = 'collaborator' | 'admin';

export interface ISeats {
  data: {
    type: 'seats';
    attributes: {
      admins_number: number;
      project_moderators_number: number;
    };
  };
}
