import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { ISmsCampaign } from './types';

const sendSmsCampaignPreview = async (id: string) =>
  fetcher<ISmsCampaign>({
    path: `/campaigns/${id}/send_preview`,
    action: 'post',
    body: {},
  });

const useSendSmsCampaignPreview = () => {
  return useMutation<ISmsCampaign, CLErrors, string>({
    mutationFn: sendSmsCampaignPreview,
  });
};

export default useSendSmsCampaignPreview;
