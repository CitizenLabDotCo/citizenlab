import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'post_marker',
  variant: 'initiative',
};

const initiativeMarkersKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
} satisfies QueryKeys;

export default initiativeMarkersKeys;
