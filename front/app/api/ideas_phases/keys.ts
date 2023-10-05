import { QueryKeys } from 'utils/cl-react-query/types';
import { Params } from './types';

const baseKey = {
  type: 'ideas_phase',
};

const ideasPhasesKeys = {
  all: () => [baseKey],
  item: (parameters: Params) => [{ ...baseKey, operation: 'item', parameters }],
} satisfies QueryKeys;

export default ideasPhasesKeys;
