import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsSendSummaryKeys from './keys';
import { ISmsSendSummary, SmsSendSummaryKeys } from './types';

const fetchSmsSendSummary = ({ campaignId }: { campaignId: string }) =>
  fetcher<ISmsSendSummary>({
    path: `/campaigns/${campaignId}/sms_send_summary`,
    action: 'get',
  });

const useSmsSendSummary = (
  campaignId: string,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  return useQuery<
    ISmsSendSummary,
    CLErrors,
    ISmsSendSummary,
    SmsSendSummaryKeys
  >({
    queryKey: smsSendSummaryKeys.item({ campaignId }),
    queryFn: () => fetchSmsSendSummary({ campaignId }),
    enabled,
    // Overrides the app-wide staleTime of Infinity: these decide whether a send is allowed.
    staleTime: 0,
  });
};

export default useSmsSendSummary;
