import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollOptionsKeys from './keys';
import { IPollOption } from './types';

type UpdatePollOption = {
  optionId: string;
  questionId: string;
  title_multiloc: Multiloc;
};

const updatePollOption = async ({
  optionId,
  questionId: _questionId,
  title_multiloc,
}: UpdatePollOption) =>
  fetcher<IPollOption>({
    path: `/poll_options/${optionId}`,
    action: 'patch',
    body: { title_multiloc },
  });

const useUpdatePollOption = () => {
  const queryClient = useQueryClient();
  return useMutation<IPollOption, { errors: CLErrors }, UpdatePollOption>({
    mutationFn: updatePollOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pollOptionsKeys.list({ questionId: variables.questionId }),
      });
    },
  });
};

export default useUpdatePollOption;
