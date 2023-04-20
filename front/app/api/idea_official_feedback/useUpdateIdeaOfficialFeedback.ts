import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaOfficialFeedbackKeys from './keys';
import { IOfficialFeedback, INewFeedback } from './types';

type IUpdateFeedbackObject = {
  id: string;
  requestBody: Partial<INewFeedback>;
};

const updateIdeaOfficialFeedback = ({
  id,
  requestBody,
}: IUpdateFeedbackObject) =>
  fetcher<IOfficialFeedback>({
    path: `/official_feedback/${id}`,
    action: 'patch',
    body: { official_feedback: requestBody },
  });

const useUpdateIdeaOfficialFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation<IOfficialFeedback, CLErrors, IUpdateFeedbackObject>({
    mutationFn: updateIdeaOfficialFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ideaOfficialFeedbackKeys.lists(),
      });
    },
  });
};

export default useUpdateIdeaOfficialFeedback;
