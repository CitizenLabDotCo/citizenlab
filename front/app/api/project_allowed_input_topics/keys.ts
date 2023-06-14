import { QueryKeys } from 'utils/cl-react-query/types';
import { IProjectAllowedTopicsParams } from './types';

const baseKey = { type: 'projects_allowed_input_topic' };

const projectAllowedInputTopicsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: IProjectAllowedTopicsParams) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default projectAllowedInputTopicsKeys;
