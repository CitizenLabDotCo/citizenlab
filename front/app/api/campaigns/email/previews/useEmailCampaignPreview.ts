import { useQuery } from '@tanstack/react-query';
import { CLErrors, SupportedLocale } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignPreviewsKeys from './keys';
import { IEmailCampaignPreview, EmailCampaignPreviewsKeys } from './types';

const fetchEmailCampaignPreview = ({
  campaignId,
  locale,
}: {
  campaignId: string;
  locale?: SupportedLocale;
}) =>
  fetcher<IEmailCampaignPreview>({
    path: `/campaigns/${campaignId}/email_preview`,
    action: 'get',
    queryParams: { locale },
  });

const useEmailCampaignPreview = (
  campaignId: string,
  locale?: SupportedLocale
) => {
  return useQuery<
    IEmailCampaignPreview,
    CLErrors,
    IEmailCampaignPreview,
    EmailCampaignPreviewsKeys
  >({
    queryKey: emailCampaignPreviewsKeys.item({ campaignId, locale }),
    queryFn: () => fetchEmailCampaignPreview({ campaignId, locale }),
  });
};

export default useEmailCampaignPreview;
