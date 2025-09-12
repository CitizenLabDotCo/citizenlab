import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'file', variant: 'event' };

const eventFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ eventId }: { eventId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { eventId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default eventFilesKeys;
