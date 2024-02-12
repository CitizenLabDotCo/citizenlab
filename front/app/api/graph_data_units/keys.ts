import { QueryKeys } from 'utils/cl-react-query/types';
import { ParametersLive, ParametersPublished } from './requestTypes';

const baseKey = {
  type: 'report_builder_data_units',
};

const graphDataUnitKeys = {
  all: () => [baseKey],
  item: (parameters: ParametersLive | ParametersPublished) => [
    {
      ...baseKey,
      operation: 'item',
      parameters,
    },
  ],
} satisfies QueryKeys;

export default graphDataUnitKeys;
