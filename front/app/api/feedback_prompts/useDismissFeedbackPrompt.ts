import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IFeedbackPrompt } from './types';
import { FEEDBACK_PROMPT_MUTATION_META } from './useShowNextFeedbackPrompt';

const dismissFeedbackPrompt = (id: string) =>
  fetcher<IFeedbackPrompt>({
    path: `/feedback_prompts/${id}/dismiss`,
    action: 'patch',
    body: {},
  });

const useDismissFeedbackPrompt = () => {
  return useMutation<IFeedbackPrompt, CLErrors, string>({
    mutationFn: dismissFeedbackPrompt,
    meta: FEEDBACK_PROMPT_MUTATION_META,
  });
};

export default useDismissFeedbackPrompt;
