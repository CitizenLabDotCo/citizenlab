import { QueryKeys } from 'utils/cl-react-query/types';

import { ICustomFieldInputType } from './types';

const baseKey = { type: 'custom_field' };

const customFieldsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: {
    projectId?: string;
    phaseId?: string;
    inputTypes?: ICustomFieldInputType[];
    copy?: boolean;
  }) => [{ ...baseKey, operation: 'list', parameters: params }],
} satisfies QueryKeys;

export default customFieldsKeys;
