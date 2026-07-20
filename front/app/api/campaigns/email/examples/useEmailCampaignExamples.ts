import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignExamplesKeys from './keys';
import {
  IEmailCampaignExamples,
  EmailCampaignExamplesKeys,
  IEmailCampaignExampleParameters,
} from './types';

const fetchEmailCampaignExamples = ({
  campaignId,
}: IEmailCampaignExampleParameters) =>
  fetcher<IEmailCampaignExamples>({
    path: `/campaigns/${campaignId}/examples`,
    action: 'get',
  });

const useEmailCampaignExamples = ({
  campaignId,
}: IEmailCampaignExampleParameters) => {
  return useQuery<
    IEmailCampaignExamples,
    CLErrors,
    IEmailCampaignExamples,
    EmailCampaignExamplesKeys
  >({
    queryKey: emailCampaignExamplesKeys.list({ campaignId }),
    queryFn: () => fetchEmailCampaignExamples({ campaignId }),
    enabled: !!campaignId,
  });
};

export default useEmailCampaignExamples;
