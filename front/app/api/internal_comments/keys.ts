import { QueryKeys } from 'utils/cl-react-query/types';
import {
  IInternalCommentParameters,
  IInternalCommentQueryParameters,
} from './types';

const baseKey = { type: 'internal_comment' };

const internalCommentKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (
    params: IInternalCommentParameters & IInternalCommentQueryParameters
  ) => [{ ...baseKey, operation: 'list', parameters: params }],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default internalCommentKeys;
