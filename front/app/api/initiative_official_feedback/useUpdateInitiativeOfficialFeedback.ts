import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeOfficialFeedbackKeys from './keys';
import { IOfficialFeedback, INewFeedback } from './types';

type IUpdateFeedbackObject = {
  id: string;
  requestBody: Partial<INewFeedback>;
};

const updateInitiativeOfficialFeedback = ({
  id,
  requestBody,
}: IUpdateFeedbackObject) =>
  fetcher<IOfficialFeedback>({
    path: `/official_feedback/${id}`,
    action: 'patch',
    body: { official_feedback: requestBody },
  });

const useUpdateInitiativeOfficialFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation<IOfficialFeedback, CLErrors, IUpdateFeedbackObject>({
    mutationFn: updateInitiativeOfficialFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativeOfficialFeedbackKeys.lists(),
      });
    },
  });
};

export default useUpdateInitiativeOfficialFeedback;
