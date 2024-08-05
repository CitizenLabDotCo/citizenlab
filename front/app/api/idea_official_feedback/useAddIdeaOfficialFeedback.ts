import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import ideasCountKeys from 'api/idea_count/keys';

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ideaOfficialFeedbackKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ideasCountKeys.all(),
      });
    },
  });
};

export default useAddIdeaOfficialFeedback;
