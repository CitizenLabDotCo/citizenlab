import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'user',
  variant: 'me',
};

const meKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default meKeys;
