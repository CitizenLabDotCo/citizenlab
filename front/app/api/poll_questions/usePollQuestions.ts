import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollOptionsKeys from './keys';
import {
  IPollQuestions,
  PollQuestionsKeys,
  IPollQuestionParameters,
} from './types';

const fetchQuestions = ({
  participationContextId,
  participationContextType,
}: IPollQuestionParameters) =>
  fetcher<IPollQuestions>({
    path: `/${participationContextType}s/${participationContextId}/poll_questions`,
    action: 'get',
  });

const usePollQuestions = ({
  participationContextId,
  participationContextType,
}: IPollQuestionParameters) => {
  return useQuery<IPollQuestions, CLErrors, IPollQuestions, PollQuestionsKeys>({
    queryKey: pollOptionsKeys.list({
      participationContextId,
      participationContextType,
    }),
    queryFn: () =>
      fetchQuestions({ participationContextId, participationContextType }),
  });
};

export default usePollQuestions;
