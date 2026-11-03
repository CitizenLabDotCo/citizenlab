import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignsKeys from './keys';
import { IEmailCampaign } from './types';

const sendEmailCampaign = async (id: string) =>
  fetcher<IEmailCampaign>({
    path: `/campaigns/${id}/send`,
    action: 'post',
    body: {},
  });

const useSendEmailCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<IEmailCampaign, CLErrors, string>({
    mutationFn: sendEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignsKeys.all() });
    },
  });
};

export default useSendEmailCampaign;
