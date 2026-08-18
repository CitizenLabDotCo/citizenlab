import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'sms_recipients',
};

const smsCampaignRecipientsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ campaignId }: { campaignId: string }) => [
    { ...baseKey, operation: 'item', parameters: { id: campaignId } },
  ],
} satisfies QueryKeys;

export default smsCampaignRecipientsKeys;
