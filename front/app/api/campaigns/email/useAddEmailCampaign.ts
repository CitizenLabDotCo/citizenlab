import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignsKeys from './keys';
import { IEmailCampaign, IEmailCampaignAdd } from './types';
import { getEmailCampaignsContextPath } from './util';

const addEmailCampaign = async ({
  context,
  ...requestBody
}: IEmailCampaignAdd) => {
  return fetcher<IEmailCampaign>({
    path: `/${getEmailCampaignsContextPath(context)}`,
    action: 'post',
    body: { campaign: requestBody },
  });
};

const useAddEmailCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<IEmailCampaign, CLErrors, IEmailCampaignAdd>({
    mutationFn: addEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignsKeys.lists() });
    },
  });
};

export default useAddEmailCampaign;
