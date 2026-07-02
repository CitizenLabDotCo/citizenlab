import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignsKeys from './keys';
import { IEmailCampaign, EmailCampaignAdd } from './types';
import { getCampaignsContextPath } from './util';

const addEmailCampaign = async ({
  context,
  ...requestBody
}: EmailCampaignAdd) => {
  return fetcher<IEmailCampaign>({
    path: `/${getCampaignsContextPath(context)}`,
    action: 'post',
    body: { campaign: requestBody },
  });
};

const useAddEmailCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<IEmailCampaign, CLErrors, EmailCampaignAdd>({
    mutationFn: addEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsKeys.lists() });
    },
  });
};

export default useAddEmailCampaign;
