import { QueryKeys } from 'utils/cl-react-query/types';

import { IParameters } from './types';

const itemKey = { type: 'json_forms_schema' };
const baseKey = { type: 'json_forms_schema', variant: 'idea' };

const ideaJsonFormsSchemaKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: IParameters) => [
    { ...itemKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default ideaJsonFormsSchemaKeys;
