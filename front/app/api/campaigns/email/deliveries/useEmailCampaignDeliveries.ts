import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignDeliveriesKeys from './keys';
import {
  IEmailCampaignDeliveries,
  EmailCampaignDeliveriesKeys,
  IEmailDeliveriesParameters,
} from './types';

const fetchEmailCampaignDeliveries = ({
  pageNumber,
  pageSize,
  campaignId,
}: IEmailDeliveriesParameters) =>
  fetcher<IEmailCampaignDeliveries>({
    path: `/campaigns/${campaignId}/email_deliveries`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber,
      'page[size]': pageSize,
    },
  });

const useEmailCampaignDeliveries = (params: IEmailDeliveriesParameters) => {
  return useQuery<
    IEmailCampaignDeliveries,
    CLErrors,
    IEmailCampaignDeliveries,
    EmailCampaignDeliveriesKeys
  >({
    queryKey: emailCampaignDeliveriesKeys.list(params),
    queryFn: () => fetchEmailCampaignDeliveries(params),
  });
};

export default useEmailCampaignDeliveries;
