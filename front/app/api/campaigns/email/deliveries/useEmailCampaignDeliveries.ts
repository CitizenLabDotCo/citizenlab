import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignDeliveriesKeys from './keys';
import {
  ICampaignDeliveries,
  CampaignDeliveriesKeys,
  ICampaignDeliveriesParameters,
} from './types';

const fetchEmailCampaignDeliveries = ({
  pageNumber,
  pageSize,
  campaignId,
}: ICampaignDeliveriesParameters) =>
  fetcher<ICampaignDeliveries>({
    path: `/campaigns/${campaignId}/email_deliveries`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber,
      'page[size]': pageSize,
    },
  });

const useEmailCampaignDeliveries = (params: ICampaignDeliveriesParameters) => {
  return useQuery<
    ICampaignDeliveries,
    CLErrors,
    ICampaignDeliveries,
    CampaignDeliveriesKeys
  >({
    queryKey: campaignDeliveriesKeys.list(params),
    queryFn: () => fetchEmailCampaignDeliveries(params),
  });
};

export default useEmailCampaignDeliveries;
