import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import optionKeys from './keys';

const deleteOption = async ({
  optionId,
}: {
  questionId: string;
  optionId: string;
}) =>
  fetcher({
    path: `/poll_options/${optionId}`,
    action: 'delete',
  });

const useDeletePollOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: optionKeys.list({ questionId: variables.questionId }),
      });
    },
  });
};

export default useDeletePollOption;
