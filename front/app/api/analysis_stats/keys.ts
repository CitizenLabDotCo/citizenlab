import { QueryKeys } from 'utils/cl-react-query/types';
import { AuthorsByDomicileQueryParams, AuthorsByAgeQueryParams } from './types';

const authorsByDomicileBaseKey = { type: 'authors_by_domicile' };

export const authorsByDomicileKeys = {
  all: () => [authorsByDomicileBaseKey],
  items: () => [{ ...authorsByDomicileBaseKey, operation: 'item' }],
  item: ({
    analysisId,
    params,
  }: {
    analysisId: string;
    params: AuthorsByDomicileQueryParams;
  }) => [
    {
      ...authorsByDomicileBaseKey,
      operation: 'item',
      analysisId,
      parameters: params,
    },
  ],
} satisfies QueryKeys;

const authorsByAgeBaseKey = { type: 'authors_by_age' };

export const authorsByAgeKeys = {
  all: () => [authorsByAgeBaseKey],
  items: () => [{ ...authorsByAgeBaseKey, operation: 'item' }],
  item: ({
    analysisId,
    params,
  }: {
    analysisId: string;
    params: AuthorsByAgeQueryParams;
  }) => [
    {
      ...authorsByAgeBaseKey,
      operation: 'item',
      analysisId,
      parameters: params,
    },
  ],
} satisfies QueryKeys;
