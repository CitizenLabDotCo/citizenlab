import { Keys } from 'utils/cl-react-query/types';
import usersByBirthyearKeys from './keys';

export type UsersByBirthyearKeys = Keys<typeof usersByBirthyearKeys>;

export interface IUsersByBirthyear {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key: string]: number;
    };
  };
}
