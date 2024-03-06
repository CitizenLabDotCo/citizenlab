import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import textingCampaignsKeys from './keys';
import { ITextingCampaign } from './types';

interface ITextingCampaignUpdate {
  id: string;
  message: string;
  phone_numbers: string[];
}

const updateTextingCampaign = ({
  id,
  ...requestBody
}: ITextingCampaignUpdate) =>
  fetcher<ITextingCampaign>({
    path: `/texting_campaigns/${id}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateTextingCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ITextingCampaign, CLErrors, ITextingCampaignUpdate>({
    mutationFn: updateTextingCampaign,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: textingCampaignsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: textingCampaignsKeys.item({ id: variables.id }),
      });
    },
  });
};

export default useUpdateTextingCampaign;
