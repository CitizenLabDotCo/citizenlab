import { QueryKeys } from 'utils/cl-react-query/types';

import { IInputResponseFieldsParameters } from './types';

const baseKey = {
  type: 'input_response_field',
};

const inputResponseFieldsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IInputResponseFieldsParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default inputResponseFieldsKeys;
