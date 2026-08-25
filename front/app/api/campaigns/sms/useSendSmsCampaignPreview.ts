import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsBalanceKeys from './balance/keys';
import smsSendSummaryKeys from './send_summary/keys';
import { ISmsCampaign } from './types';

const sendSmsCampaignPreview = async (id: string) =>
  fetcher<ISmsCampaign>({
    path: `/campaigns/${id}/send_sms_preview`,
    action: 'post',
    body: {},
  });

const useSendSmsCampaignPreview = () => {
  const queryClient = useQueryClient();
  return useMutation<ISmsCampaign, CLErrors, string>({
    mutationFn: sendSmsCampaignPreview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsBalanceKeys.all() });
      queryClient.invalidateQueries({ queryKey: smsSendSummaryKeys.all() });
    },
  });
};

export default useSendSmsCampaignPreview;
