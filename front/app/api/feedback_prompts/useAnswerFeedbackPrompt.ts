import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IFeedbackPrompt, IFeedbackPromptAnswer } from './types';
import { FEEDBACK_PROMPT_MUTATION_META } from './useShowNextFeedbackPrompt';

const answerFeedbackPrompt = ({ id, ...answer }: IFeedbackPromptAnswer) =>
  fetcher<IFeedbackPrompt>({
    path: `/feedback_prompts/${id}/answer`,
    action: 'patch',
    body: { feedback_prompt: answer },
  });

const useAnswerFeedbackPrompt = () => {
  return useMutation<IFeedbackPrompt, CLErrors, IFeedbackPromptAnswer>({
    mutationFn: answerFeedbackPrompt,
    meta: FEEDBACK_PROMPT_MUTATION_META,
  });
};

export default useAnswerFeedbackPrompt;
