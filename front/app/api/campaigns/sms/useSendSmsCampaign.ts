import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsBalanceKeys from './balance/keys';
import smsCampaignsKeys from './keys';
import smsSendSummaryKeys from './send_summary/keys';
import { ISmsCampaign } from './types';

const sendSmsCampaign = async (id: string) =>
  fetcher<ISmsCampaign>({
    path: `/campaigns/${id}/send`,
    action: 'post',
    body: {},
  });

const useSendSmsCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ISmsCampaign, CLErrors, string>({
    mutationFn: sendSmsCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsCampaignsKeys.all() });
      queryClient.invalidateQueries({ queryKey: smsBalanceKeys.all() });
      queryClient.invalidateQueries({ queryKey: smsSendSummaryKeys.all() });
    },
  });
};

export default useSendSmsCampaign;
