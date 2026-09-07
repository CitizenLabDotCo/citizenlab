import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'sms_send_summary',
};

const smsSendSummaryKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ campaignId }: { campaignId: string }) => [
    { ...baseKey, operation: 'item', parameters: { id: campaignId } },
  ],
} satisfies QueryKeys;

export default smsSendSummaryKeys;
