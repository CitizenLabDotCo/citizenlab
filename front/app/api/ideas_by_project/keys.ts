import { QueryKeys } from 'utils/cl-react-query/types';

import { IIdeasByProjectParams } from './types';

const baseKey = { type: 'ideas_by_project' };

const ideasByProjectKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: IIdeasByProjectParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default ideasByProjectKeys;
