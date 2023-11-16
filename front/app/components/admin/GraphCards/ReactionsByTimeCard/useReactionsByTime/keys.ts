import { QueryKeys } from 'utils/cl-react-query/types';
import { QueryParameters } from './typings';

const baseKey = { type: 'report_builder_data_units' };

const usersByAgeKeys = {
  all: () => [baseKey],
  item: (params: QueryParameters) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default usersByAgeKeys;
