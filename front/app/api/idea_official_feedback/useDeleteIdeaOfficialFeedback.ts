import { useMutation, useQueryClient } from '@tanstack/react-query';

import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaOfficialFeedbackKeys from './keys';

const deleteIdeaOfficialFeedback = (id: string) =>
  fetcher({
    path: `/official_feedback/${id}`,
    action: 'delete',
  });

const useDeleteIdeaOfficialFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIdeaOfficialFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries(ideaFilterCountsKeys.all());
      queryClient.invalidateQueries({
        queryKey: ideaOfficialFeedbackKeys.lists(),
      });
    },
  });
};

export default useDeleteIdeaOfficialFeedback;
