import { QueryKeys } from 'utils/cl-react-query/types';
import { ICampaignExampleParameters } from './types';

const baseKey = { type: 'example' };

const campaignExamplesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: ICampaignExampleParameters) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default campaignExamplesKeys;
