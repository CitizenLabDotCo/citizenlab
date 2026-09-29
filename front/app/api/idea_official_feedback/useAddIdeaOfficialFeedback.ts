import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import ideasKeys from 'api/ideas/keys';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaOfficialFeedbackKeys from './keys';
import { INewFeedback, IOfficialFeedback } from './types';

const addIdeaOfficialFeedback = async ({
  ideaId,
  ...requestBody
}: INewFeedback) =>
  fetcher<IOfficialFeedback>({
    path: `/ideas/${ideaId}/official_feedback`,
    action: 'post',
    body: { official_feedback: requestBody },
  });

const useAddIdeaOfficialFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation<IOfficialFeedback, CLErrors, INewFeedback>({
    mutationFn: addIdeaOfficialFeedback,
    onSuccess: (_feedback, { ideaId }) => {
      queryClient.invalidateQueries({
        queryKey: ideaOfficialFeedbackKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ideaFilterCountsKeys.items(),
      });
      // The idea's official_feedbacks_count decides whether it awaits a reply.
      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: ideaId }),
      });
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
    },
  });
};

export default useAddIdeaOfficialFeedback;
