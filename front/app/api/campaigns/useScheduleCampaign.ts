import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignKeys from './keys';
import { ICampaign } from './types';

const scheduleCampaign = async ({
  id,
  scheduledAt,
}: {
  id: string;
  scheduledAt: string | null;
}) =>
  fetcher<ICampaign>({
    path: `/campaigns/${id}`,
    action: 'patch',
    body: { scheduled_at: scheduledAt },
  });

const useScheduleCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ICampaign,
    CLErrors,
    { id: string; scheduledAt: string | null }
  >({
    mutationFn: scheduleCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all() });
    },
  });
};

export default useScheduleCampaign;
