import { QueryKeys } from 'utils/cl-react-query/types';
import { ICustomFieldsParameters } from './types';

const baseKey = { type: 'custom_field' };

const customFieldsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: ICustomFieldsParameters) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default customFieldsKeys;
