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
    onSuccess: (_data, { ideaId }) => {
      queryClient.invalidateQueries({
        queryKey: ideaOfficialFeedbackKeys.lists(),
      });
      // The idea carries official_feedbacks_count.
      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: ideaId }),
      });
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: ideaFilterCountsKeys.items(),
      });
    },
  });
};

export default useAddIdeaOfficialFeedback;
