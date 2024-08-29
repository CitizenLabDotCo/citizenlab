import { QueryKeys } from 'utils/cl-react-query/types';

import { IDeleteEventFileProperties } from './types';

const itemKey = { type: 'file' };
const baseKey = { type: 'file', variant: 'event' };

const eventFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ eventId }: { eventId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { eventId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (properties: IDeleteEventFileProperties) => [
    {
      ...itemKey,
      operation: 'item',
      parameters: { id: properties.eventId },
    },
  ],
} satisfies QueryKeys;

export default eventFilesKeys;
