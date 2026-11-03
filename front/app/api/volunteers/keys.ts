import { QueryKeys } from 'utils/cl-react-query/types';

import { IVolunteersParameters } from './types';

const baseKey = { type: 'volunteer' };

const volunteersKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IVolunteersParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default volunteersKeys;
