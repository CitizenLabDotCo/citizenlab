import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'verification_method' };

const verificationMethodsKeys = {
  all: () => [baseKey],
  list: () => [{ ...baseKey, operation: 'list', parameters: {} }],
  item: ({ endpoint }: { endpoint: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: {
        endpoint,
      },
    },
  ],
} satisfies QueryKeys;

export default verificationMethodsKeys;
