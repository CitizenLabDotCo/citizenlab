import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignExamplesKeys from './keys';
import { IEmailCampaignExample, EmailCampaignExamplesKeys } from './types';

const fetchEmailCampaignExample = ({ id }: { id: string }) =>
  fetcher<IEmailCampaignExample>({
    path: `/campaigns/examples/${id}`,
    action: 'get',
  });

const useEmailCampaignExample = (id: string) => {
  return useQuery<
    IEmailCampaignExample,
    CLErrors,
    IEmailCampaignExample,
    EmailCampaignExamplesKeys
  >({
    queryKey: emailCampaignExamplesKeys.item({ id }),
    queryFn: () => fetchEmailCampaignExample({ id }),
  });
};

export default useEmailCampaignExample;
