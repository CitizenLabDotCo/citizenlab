import { useMutation, useQueryClient } from '@tanstack/react-query';

import ideasKeys from 'api/ideas/keys';
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
      queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.items() });
      queryClient.invalidateQueries({
        queryKey: ideaOfficialFeedbackKeys.lists(),
      });
      // The idea's official_feedbacks_count decides whether it awaits a reply.
      queryClient.invalidateQueries({ queryKey: ideasKeys.all() });
    },
  });
};

export default useDeleteIdeaOfficialFeedback;
