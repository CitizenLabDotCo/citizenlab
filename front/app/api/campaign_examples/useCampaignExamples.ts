import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignExamplesKeys from './keys';
import {
  ICampaignExamples,
  CampaignExamplesKeys,
  ICampaignExampleParameters,
} from './types';

const fetchCampaignExamples = ({ campaignId }: ICampaignExampleParameters) =>
  fetcher<ICampaignExamples>({
    path: `/campaigns/${campaignId}/examples`,
    action: 'get',
  });

const useCampaignExamples = ({ campaignId }: ICampaignExampleParameters) => {
  return useQuery<
    ICampaignExamples,
    CLErrors,
    ICampaignExamples,
    CampaignExamplesKeys
  >({
    queryKey: campaignExamplesKeys.list({ campaignId }),
    queryFn: () => fetchCampaignExamples({ campaignId }),
  });
};

export default useCampaignExamples;
