import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'locked_attribute' };

const userLockedAttributesKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default userLockedAttributesKeys;
