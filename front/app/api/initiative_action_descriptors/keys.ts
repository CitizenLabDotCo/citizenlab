import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'initiativs',
  variant: 'action_descriptor',
};

const initiativeActionDescriptorsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default initiativeActionDescriptorsKeys;
