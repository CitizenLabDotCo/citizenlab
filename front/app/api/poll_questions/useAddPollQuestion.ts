import { useMutation } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IPollQuestion, IPollQuestionParameters } from './types';
import { capitalizeParticipationContextType } from 'utils/helperUtils';
import invalidatePollQuestionsCache from './util/invalidatePollQuestionsCache';

type AddPollQuestion = {
  title_multiloc: Multiloc;
} & IPollQuestionParameters;

const addPollQuestion = async ({
  participationContextId,
  participationContextType,
  title_multiloc,
}: AddPollQuestion) =>
  fetcher<IPollQuestion>({
    path: `/poll_questions`,
    action: 'post',
    body: {
      participation_context_id: participationContextId,
      participation_context_type: capitalizeParticipationContextType(
        participationContextType
      ),
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
