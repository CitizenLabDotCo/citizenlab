import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'publication_recipient_count',
} as const;

const publicationRecipientCountKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ projectId }: { projectId: string }) => [
    { ...baseKey, operation: 'item', parameters: { projectId } },
  ],
} satisfies QueryKeys;

export default publicationRecipientCountKeys;
