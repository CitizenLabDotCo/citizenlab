import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignDeliveriesKeys from './keys';
import {
  ICampaignDeliveries,
  CampaignDeliveriesKeys,
  IParameters,
} from './types';

const fetchCampaignDeliveries = ({
  pageNumber,
  pageSize,
  campaignId,
}: IParameters) =>
  fetcher<ICampaignDeliveries>({
    path: `/campaigns/${campaignId}/deliveries`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber,
      'page[size]': pageSize,
    },
  });

const useCampaignDeliveries = (params: IParameters) => {
  return useQuery<
    ICampaignDeliveries,
    CLErrors,
    ICampaignDeliveries,
    CampaignDeliveriesKeys
  >({
    queryKey: campaignDeliveriesKeys.list(params),
    queryFn: () => fetchCampaignDeliveries(params),
  });
};

export default useCampaignDeliveries;
