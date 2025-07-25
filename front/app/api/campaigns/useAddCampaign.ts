import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignsKeys from './keys';
import { ICampaign, CampaignAdd } from './types';
import { getCampaignsContextPath } from './util';

const addCampaign = async ({
  projectId,
  phaseId,
  ...requestBody
}: CampaignAdd) => {
  return fetcher<ICampaign>({
    path: `/${getCampaignsContextPath({ projectId, phaseId })}`,
    action: 'post',
    body: { campaign: requestBody },
  });
};

const useAddCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ICampaign, CLErrors, CampaignAdd>({
    mutationFn: addCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsKeys.lists() });
    },
  });
};

export default useAddCampaign;
