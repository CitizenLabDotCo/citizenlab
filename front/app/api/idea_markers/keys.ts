import { QueryKeys } from 'utils/cl-react-query/types';
import { QueryParameters } from './types';

const baseKeys = { type: 'post_marker', variant: 'idea' };

const ideaMarkersKeys = {
  all: () => [baseKeys],
  lists: () => [{ ...baseKeys, operation: 'list' }],
  list: (parameters: QueryParameters) => [
    {
      ...baseKeys,
      operation: 'list',
      parameters,
    },
  ],
} satisfies QueryKeys;

export default ideaMarkersKeys;
