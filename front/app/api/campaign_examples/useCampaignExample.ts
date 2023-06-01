import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignExampleKeys from './keys';
import { ICampaignExample, CampaignExamplesKeys } from './types';

const fetchCampaignExample = ({ id }: { id: string }) =>
  fetcher<ICampaignExample>({
    path: `/campaigns/examples/${id}`,
    action: 'get',
  });

const useCampaignExample = (id: string) => {
  return useQuery<
    ICampaignExample,
    CLErrors,
    ICampaignExample,
    CampaignExamplesKeys
  >({
    queryKey: campaignExampleKeys.item({ id }),
    queryFn: () => fetchCampaignExample({ id }),
  });
};

export default useCampaignExample;
