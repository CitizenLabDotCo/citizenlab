import { QueryKeys } from 'utils/cl-react-query/types';

import { ICommentsByProjectParams } from './types';

const baseKey = { type: 'comments_by_project' };

const commentsByProjectKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: ICommentsByProjectParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default commentsByProjectKeys;
