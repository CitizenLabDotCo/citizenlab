import { useMutation, useQueryClient } from '@tanstack/react-query';

import moderationsCountKeys from 'api/moderation_count/keys';
import moderationsKeys from 'api/moderations/keys';

import fetcher from 'utils/cl-react-query/fetcher';

const removeFlag = (id: string) =>
  fetcher({
    path: `/inappropriate_content_flags/${id}/mark_as_deleted`,
    action: 'patch',
  });

const useRemoveInappropriateContentFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: moderationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: moderationsCountKeys.items(),
      });
    },
  });
};

export default useRemoveInappropriateContentFlag;
