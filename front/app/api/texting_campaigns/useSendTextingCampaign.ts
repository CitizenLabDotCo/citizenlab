import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import textingCampaignsKeys from './keys';
import { ITextingCampaign } from './types';

interface ITextingCampaignSend {
  id: string;
}

const sendTextingCampaign = ({ id }: ITextingCampaignSend) =>
  fetcher<ITextingCampaign>({
    path: `/texting_campaigns/${id}/send`,
    action: 'post',
    body: {},
  });

const useSendTextingCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ITextingCampaign,
    { errors: CLErrors },
    ITextingCampaignSend
  >({
    mutationFn: sendTextingCampaign,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: textingCampaignsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: textingCampaignsKeys.item({ id: variables.id }),
      });
    },
  });
};

export default useSendTextingCampaign;
