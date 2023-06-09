import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'experiment',
};

const experimentsKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default experimentsKeys;
