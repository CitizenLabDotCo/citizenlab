import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignsKeys from './keys';
import { ICampaign, CampaignAdd } from './types';

const addCampaign = async ({
  projectId,
  phaseId,
  ...requestBody
}: CampaignAdd) => {
  let path = '/campaigns';
  if (projectId) {
    path = `/projects/${projectId}/campaigns`;
  } else if (phaseId) {
    path = `/phases/${phaseId}/campaigns`;
  }

  return fetcher<ICampaign>({
    path: path as `/${string}`,
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
