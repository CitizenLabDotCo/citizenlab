import { IDeleteEventFileProperties } from './types';

const eventFilesKeys = {
  all: () => [{ type: 'file' }],
  lists: () => [{ ...eventFilesKeys.all()[0], operation: 'list' }],
  list: (eventId?: string) => [
    { ...eventFilesKeys.all()[0], entity: 'list', eventId },
  ],
  items: () => [{ ...eventFilesKeys.all()[0], operation: 'item' }],
  item: (properties: IDeleteEventFileProperties) => [
    {
      ...eventFilesKeys.items()[0],
      properties,
    },
  ],
} as const;

export default eventFilesKeys;
