import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_block_ai_session' };

const customBlockAiSessionsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default customBlockAiSessionsKeys;
