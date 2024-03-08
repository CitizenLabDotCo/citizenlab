import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { ICampaign } from './types';

const sendCampaignPreview = async (id: string) =>
  fetcher<ICampaign>({
    path: `/campaigns/${id}/send_preview`,
    action: 'post',
    body: {},
  });

const useSendCampaignPreview = () => {
  return useMutation<ICampaign, CLErrors, string>({
    mutationFn: sendCampaignPreview,
  });
};

export default useSendCampaignPreview;
