import { QueryKeys } from 'utils/cl-react-query/types';
import { AuthorsByDomicileQueryParams } from './types';

const baseKey = { type: 'authors_by_domicile' };

const authorsByDomicileKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({
    analysisId,
    params,
  }: {
    analysisId: string;
    params: AuthorsByDomicileQueryParams;
  }) => [{ ...baseKey, operation: 'item', analysisId, parameters: params }],
} satisfies QueryKeys;

export default authorsByDomicileKeys;
