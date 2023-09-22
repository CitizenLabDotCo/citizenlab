import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import moderationKeys from './keys';
import { IModeration, TModeratableType, TModerationStatus } from './types';
import moderationsCountKeys from 'api/moderation_count/keys';

type UpdateModerationStatus = {
  moderationId: string;
  moderatableType: TModeratableType;
  moderationStatus: TModerationStatus;
};

const updateModerationStatus = async ({
  moderationId,
  moderatableType,
  moderationStatus,
}: UpdateModerationStatus) =>
  fetcher<IModeration>({
    path: `/moderations/${moderatableType}/${moderationId}`,
    action: 'patch',
    body: { moderation: { moderation_status: moderationStatus } },
  });

const useUpdateModerationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<IModeration, CLErrors, UpdateModerationStatus>({
    mutationFn: updateModerationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: moderationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: moderationsCountKeys.items(),
      });
    },
  });
};

export default useUpdateModerationStatus;
