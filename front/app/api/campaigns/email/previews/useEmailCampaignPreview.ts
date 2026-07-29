import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignPreviewsKeys from './keys';
import { IEmailCampaignPreview, EmailCampaignPreviewsKeys } from './types';

const fetchEmailCampaignPreview = ({ campaignId }: { campaignId: string }) =>
  fetcher<IEmailCampaignPreview>({
    path: `/campaigns/${campaignId}/email_preview`,
    action: 'get',
  });

const useEmailCampaignPreview = (campaignId: string) => {
  return useQuery<
    IEmailCampaignPreview,
    CLErrors,
    IEmailCampaignPreview,
    EmailCampaignPreviewsKeys
  >({
    queryKey: emailCampaignPreviewsKeys.item({ campaignId }),
    queryFn: () => fetchEmailCampaignPreview({ campaignId }),
  });
};

export default useEmailCampaignPreview;
