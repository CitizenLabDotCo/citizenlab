import { QueryKeys } from 'utils/cl-react-query/types';
import { IProjectGroupsParams } from './types';

const baseKey = { type: 'projects_allowed_input_topic' };

const projectGroupsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: IProjectGroupsParams) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default projectGroupsKeys;
