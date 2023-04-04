import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeOfficialFeedbackKeys from './keys';

const deleteInitiativeOfficialFeedback = (id: string) =>
  fetcher({
    path: `/official_feedback/${id}`,
    action: 'delete',
  });

const useDeleteInitiativeOfficialFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInitiativeOfficialFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativeOfficialFeedbackKeys.lists(),
      });
    },
  });
};

export default useDeleteInitiativeOfficialFeedback;
