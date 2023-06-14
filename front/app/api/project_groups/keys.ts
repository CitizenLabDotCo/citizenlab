import { QueryKeys } from 'utils/cl-react-query/types';
import { IProjectGroupsParams } from './types';

const baseKey = { type: 'groups_project' };

const projectGroupsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: IProjectGroupsParams) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default projectGroupsKeys;
