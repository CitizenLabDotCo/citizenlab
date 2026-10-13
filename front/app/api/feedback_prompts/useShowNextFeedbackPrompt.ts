import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { FeedbackPromptUiVersion, IFeedbackPrompt } from './types';

export const FEEDBACK_PROMPT_MUTATION_META = { feedbackPrompt: true };

const showNextFeedbackPrompt = (uiVersion: FeedbackPromptUiVersion) =>
  fetcher<IFeedbackPrompt | null>({
    path: '/feedback_prompts/show_next',
    action: 'post',
    body: { ui_version: uiVersion },
  });

const useShowNextFeedbackPrompt = () => {
  return useMutation<IFeedbackPrompt | null, CLErrors, FeedbackPromptUiVersion>(
    {
      mutationFn: showNextFeedbackPrompt,
      meta: FEEDBACK_PROMPT_MUTATION_META,
    }
  );
};

export default useShowNextFeedbackPrompt;
