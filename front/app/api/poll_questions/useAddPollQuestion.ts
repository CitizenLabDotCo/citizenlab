import { useMutation } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IPollQuestion, IPollQuestionParameters } from './types';
import invalidatePollQuestionsCache from './util/invalidatePollQuestionsCache';

type AddPollQuestion = {
  title_multiloc: Multiloc;
} & IPollQuestionParameters;

const addPollQuestion = async ({ phaseId, title_multiloc }: AddPollQuestion) =>
  fetcher<IPollQuestion>({
    path: `/poll_questions`,
    action: 'post',
    body: {
      phase_id: phaseId,
      title_multiloc,
    },
  });

const useAddPollQuestion = () => {
  return useMutation<IPollQuestion, { errors: CLErrors }, AddPollQuestion>({
    mutationFn: addPollQuestion,
    onSuccess: (_data, variables) => {
      invalidatePollQuestionsCache(variables);
    },
  });
};

export default useAddPollQuestion;
