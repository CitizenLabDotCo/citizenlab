import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignExamplesKeys from './keys';
import { ICampaignExample, CampaignExamplesKeys } from './types';

const fetchEmailCampaignExample = ({ id }: { id: string }) =>
  fetcher<ICampaignExample>({
    path: `/campaigns/examples/${id}`,
    action: 'get',
  });

const useEmailCampaignExample = (id: string) => {
  return useQuery<
    ICampaignExample,
    CLErrors,
    ICampaignExample,
    CampaignExamplesKeys
  >({
    queryKey: campaignExamplesKeys.item({ id }),
    queryFn: () => fetchEmailCampaignExample({ id }),
  });
};

export default useEmailCampaignExample;
