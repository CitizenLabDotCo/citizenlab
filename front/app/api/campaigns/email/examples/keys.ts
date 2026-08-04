import { QueryKeys } from 'utils/cl-react-query/types';

import { IEmailCampaignExampleParameters } from './types';

const baseKey = { type: 'email_example' };

const emailCampaignExamplesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: IEmailCampaignExampleParameters) => [
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

export default emailCampaignExamplesKeys;
