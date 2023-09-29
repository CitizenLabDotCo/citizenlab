import { QueryKeys } from 'utils/cl-react-query/types';
import { IInputsQueryParams } from './types';

const baseKey = { type: 'analysis_input' };

const inputsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({
    analysisId,
    filters,
  }: {
    analysisId: string;
    filters?: IInputsQueryParams;
  }) => [
    {
      ...baseKey,
      operation: 'list',
      analysisId,
      parameters: { analysisId, ...filters },
    },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default inputsKeys;
