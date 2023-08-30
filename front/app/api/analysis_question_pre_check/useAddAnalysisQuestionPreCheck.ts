import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IQuestionPreCheck, IQuestionPreCheckAdd } from './types';

const addAnalysisQuestionPreCheck = async ({
  analysisId,
  filters,
}: IQuestionPreCheckAdd) =>
  fetcher<IQuestionPreCheck>({
    path: `/analyses/${analysisId}/questions/pre_check`,
    action: 'post',
    body: { question: { filters } },
  });

const useAddAnalysisQuestionPreCheck = () => {
  return useMutation<IQuestionPreCheck, CLErrors, IQuestionPreCheckAdd>({
    mutationFn: addAnalysisQuestionPreCheck,
  });
};

export default useAddAnalysisQuestionPreCheck;
