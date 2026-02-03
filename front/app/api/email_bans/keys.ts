import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'email_ban' };

const emailBansKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ email }: { email: string }) => [
    { ...baseKey, operation: 'item', parameters: { email } },
  ],
} satisfies QueryKeys;

export default emailBansKeys;
