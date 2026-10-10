import { SupportedLocale } from 'typings';

import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'email_campaign_preview' };

const emailCampaignPreviewsKeys = {
  all: () => [baseKey],
  item: ({
    campaignId,
    locale,
  }: {
    campaignId: string | null;
    locale?: SupportedLocale;
  }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id: campaignId, locale },
    },
  ],
} satisfies QueryKeys;

export default emailCampaignPreviewsKeys;
