import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignDeliveriesKeys from './keys';
import {
  ISmsCampaignDeliveries,
  ISmsDeliveriesParameters,
  SmsCampaignDeliveriesKeys,
} from './types';

const fetchSmsCampaignDeliveries = ({
  campaignId,
  pageNumber,
  pageSize,
}: ISmsDeliveriesParameters) =>
  fetcher<ISmsCampaignDeliveries>({
    path: `/campaigns/${campaignId}/sms_deliveries`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber,
      'page[size]': pageSize,
    },
  });

const useSmsCampaignDeliveries = (params: ISmsDeliveriesParameters) => {
  return useQuery<
    ISmsCampaignDeliveries,
    CLErrors,
    ISmsCampaignDeliveries,
    SmsCampaignDeliveriesKeys
  >({
    queryKey: smsCampaignDeliveriesKeys.list(params),
    queryFn: () => fetchSmsCampaignDeliveries(params),
  });
};

export default useSmsCampaignDeliveries;
