import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasCountKeys from 'api/idea_count/keys';

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
      queryClient.invalidateQueries(ideasCountKeys.all());
      queryClient.invalidateQueries({
        queryKey: ideaOfficialFeedbackKeys.lists(),
      });
    },
  });
};

export default useDeleteIdeaOfficialFeedback;
