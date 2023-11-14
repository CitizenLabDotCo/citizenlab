import { QueryKeys } from 'utils/cl-react-query/types';

const itemKey = { type: 'campaign' };
const baseKey = {
  type: 'campaign',
  variant: 'texting',
};

const textingCampaignsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...itemKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default textingCampaignsKeys;
