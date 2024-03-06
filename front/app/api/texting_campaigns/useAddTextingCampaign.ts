import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import textingCampaignsKeys from './keys';
import { ITextingCampaign } from './types';

type ITextingCampaignAdd = {
  message: string;
  phone_numbers: string[];
};

const addTextingCampaign = async (requestBody: ITextingCampaignAdd) =>
  fetcher<ITextingCampaign>({
    path: '/texting_campaigns',
    action: 'post',
    body: requestBody,
  });

const useAddTextingCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ITextingCampaign, CLErrors, ITextingCampaignAdd>({
    mutationFn: addTextingCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: textingCampaignsKeys.lists() });
    },
  });
};

export default useAddTextingCampaign;
