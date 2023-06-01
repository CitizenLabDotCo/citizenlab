import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollOptionsKeys from './keys';
import { IPollOptions } from './types';

type AddPollOption = {
  questionId: string;
  title_multiloc: Multiloc;
};
const addPollOption = async ({ questionId, title_multiloc }: AddPollOption) =>
  fetcher<IPollOptions>({
    path: `/poll_questions/${questionId}/poll_options`,
    action: 'post',
    body: {
      title_multiloc,
    },
  });

const useAddPollOption = () => {
  const queryClient = useQueryClient();
  return useMutation<IPollOptions, { errors: CLErrors }, AddPollOption>({
    mutationFn: addPollOption,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pollOptionsKeys.list({ questionId: variables.questionId }),
      });
    },
  });
};

export default useAddPollOption;
