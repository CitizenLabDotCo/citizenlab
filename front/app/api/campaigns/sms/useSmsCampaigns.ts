import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignsKeys from './keys';
import {
  ISmsCampaignsData,
  SmsCampaignsQueryParameters,
  SmsCampaignsKeys,
} from './types';

const fetchSmsCampaigns = ({
  pageNumber,
  pageSize,
}: SmsCampaignsQueryParameters) =>
  fetcher<ISmsCampaignsData>({
    path: '/campaigns',
    action: 'get',
    queryParams: {
      manual: true,
      channel: 'sms',
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 20,
    },
  });

const useSmsCampaigns = (queryParams: SmsCampaignsQueryParameters = {}) => {
  return useQuery<
    ISmsCampaignsData,
    CLErrors,
    ISmsCampaignsData,
    SmsCampaignsKeys
  >({
    queryKey: smsCampaignsKeys.list(queryParams),
    queryFn: () => fetchSmsCampaigns(queryParams),
  });
};

export default useSmsCampaigns;
