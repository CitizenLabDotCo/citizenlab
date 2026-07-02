import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IEmailCampaign } from './types';

const sendEmailCampaignPreview = async (id: string) =>
  fetcher<IEmailCampaign>({
    path: `/campaigns/${id}/send_preview`,
    action: 'post',
    body: {},
  });

const useSendEmailCampaignPreview = () => {
  return useMutation<IEmailCampaign, CLErrors, string>({
    mutationFn: sendEmailCampaignPreview,
  });
};

export default useSendEmailCampaignPreview;
