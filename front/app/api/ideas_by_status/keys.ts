import { QueryKeys } from 'utils/cl-react-query/types';
import { IIdeasByStatusParams } from './types';

const baseKey = { type: 'ideas_by_status' };

const ideasByStatusKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: IIdeasByStatusParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default ideasByStatusKeys;
