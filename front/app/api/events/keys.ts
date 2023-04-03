import { QueryKeys } from 'utils/cl-react-query/types';
import { InputParameters } from './types';

const baseKey = { type: 'event' };

const eventsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: InputParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ eventId }: { eventId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { eventId },
    },
  ],
} satisfies QueryKeys;

export default eventsKeys;
