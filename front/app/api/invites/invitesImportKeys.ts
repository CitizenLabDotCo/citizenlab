import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'invites_import' };

export const invitesImportKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string | null }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default invitesImportKeys;
