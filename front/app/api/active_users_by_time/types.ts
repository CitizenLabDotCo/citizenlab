import { Keys } from 'utils/cl-react-query/types';
import activeUsersByTimeKeys from './keys';

export type ActiveUsersByTimeKeys = Keys<typeof activeUsersByTimeKeys>;

export interface IActiveUsersByTime {
  data: {
    type: 'active_users_by_time';
    attributes: {
      series: {
        users: {
          [key: string]: number;
        };
      };
    };
  };
}
export interface IActiveUsersByTimeParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  topic?: string;
  project?: string;
  interval: string;
}
