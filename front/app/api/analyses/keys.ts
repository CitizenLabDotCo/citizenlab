import { QueryKeys } from 'utils/cl-react-query/types';
import { IAnalysesQueryParams } from './types';

const baseKey = { type: 'analysis' };

const analysesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (filters: IAnalysesQueryParams) => [
    { ...baseKey, operation: 'list', parameters: filters },
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

export default analysesKeys;
