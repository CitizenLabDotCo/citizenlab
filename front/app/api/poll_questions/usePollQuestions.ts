import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollOptionsKeys from './keys';
import {
  IPollQuestions,
  PollQuestionsKeys,
  IPollQuestionParameters,
} from './types';

const fetchQuestions = ({ phaseId }: IPollQuestionParameters) =>
  fetcher<IPollQuestions>({
    path: `/phases/${phaseId}/poll_questions`,
    action: 'get',
  });

const usePollQuestions = ({ phaseId }: IPollQuestionParameters) => {
  return useQuery<IPollQuestions, CLErrors, IPollQuestions, PollQuestionsKeys>({
    queryKey: pollOptionsKeys.list({
      phaseId,
    }),
    queryFn: () => fetchQuestions({ phaseId }),
  });
};

export default usePollQuestions;
