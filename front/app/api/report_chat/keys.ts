import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'report_chat' };

const reportChatKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ reportId }: { reportId?: string }) => [
    { ...baseKey, operation: 'item', parameters: { reportId } },
  ],
} satisfies QueryKeys;

export default reportChatKeys;
