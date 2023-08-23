import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import questionsKeys from './keys';
import { IQuestion, QuestionsKeys, IQuestionParams } from './types';

const fetchQuestion = ({ analysisId, id }: IQuestionParams) => {
  return fetcher<IQuestion>({
    path: `/analyses/${analysisId}/questions/${id}`,
    action: 'get',
  });
};

const useAnalysisQuestion = (params: IQuestionParams) => {
  return useQuery<IQuestion, CLErrors, IQuestion, QuestionsKeys>({
    queryKey: questionsKeys.item({ id: params.id }),
    queryFn: () => fetchQuestion(params),
  });
};

export default useAnalysisQuestion;
