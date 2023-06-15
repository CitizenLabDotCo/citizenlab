import { QueryKeys } from 'utils/cl-react-query/types';
import { ICommentParameters, ICommentQueryParameters } from './types';

const baseKey = { type: 'comment' };

const commentKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: ICommentParameters & ICommentQueryParameters) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default commentKeys;
