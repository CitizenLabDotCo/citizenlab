import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignsKeys from './keys';
import { ISmsCampaign } from './types';

const sendSmsCampaign = async (id: string) =>
  fetcher<ISmsCampaign>({
    path: `/campaigns/${id}/send`,
    action: 'post',
    body: {},
  });

const useSendSmsCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ISmsCampaign, CLErrors, string>({
    mutationFn: sendSmsCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsCampaignsKeys.all() });
    },
  });
};

export default useSendSmsCampaign;
