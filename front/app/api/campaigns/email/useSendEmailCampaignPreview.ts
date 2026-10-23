import { useMutation } from '@tanstack/react-query';
import { CLErrors, SupportedLocale } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IEmailCampaign } from './types';

type SendEmailCampaignPreview = {
  id: string;
  locale: SupportedLocale;
};

const sendEmailCampaignPreview = async ({
  id,
  locale,
}: SendEmailCampaignPreview) =>
  fetcher<IEmailCampaign>({
    path: `/campaigns/${id}/send_email_preview`,
    action: 'post',
    body: { locale },
  });

const useSendEmailCampaignPreview = () => {
  return useMutation<IEmailCampaign, CLErrors, SendEmailCampaignPreview>({
    mutationFn: sendEmailCampaignPreview,
  });
};

export default useSendEmailCampaignPreview;
