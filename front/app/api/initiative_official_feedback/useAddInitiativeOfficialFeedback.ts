import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeOfficialFeedbackKeys from './keys';
import { INewFeedback, IOfficialFeedback } from './types';

const addInitiativeOfficialFeedback = async ({
  initiativeId,
  ...requestBody
}: INewFeedback) =>
  fetcher<IOfficialFeedback>({
    path: `/initiatives/${initiativeId}/official_feedback`,
    action: 'post',
    body: { official_feedback: requestBody },
  });

const useAddInitiativeOfficialFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation<IOfficialFeedback, CLErrors, INewFeedback>({
    mutationFn: addInitiativeOfficialFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativeOfficialFeedbackKeys.lists(),
      });
    },
  });
};

export default useAddInitiativeOfficialFeedback;
