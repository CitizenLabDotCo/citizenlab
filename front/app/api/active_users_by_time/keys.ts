import { QueryKeys } from 'utils/cl-react-query/types';
import { IActiveUsersByTimeParams } from './types';

const baseKey = { type: 'active_users_by_time' };

const activeUsersByTimeKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: IActiveUsersByTimeParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default activeUsersByTimeKeys;
