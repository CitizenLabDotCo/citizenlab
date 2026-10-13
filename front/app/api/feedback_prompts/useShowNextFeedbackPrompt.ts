import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IFeedbackPrompt, IShowNextFeedbackPrompt } from './types';

export const FEEDBACK_PROMPT_MUTATION_META = { feedbackPrompt: true };

const showNextFeedbackPrompt = ({
  trigger,
  uiVersion,
  adminArea,
}: IShowNextFeedbackPrompt) =>
  fetcher<IFeedbackPrompt | null>({
    path: '/feedback_prompts/show_next',
    action: 'post',
    body: { trigger, ui_version: uiVersion, admin_area: adminArea },
  });

const useShowNextFeedbackPrompt = () => {
  return useMutation<IFeedbackPrompt | null, CLErrors, IShowNextFeedbackPrompt>(
    {
      mutationFn: showNextFeedbackPrompt,
      meta: FEEDBACK_PROMPT_MUTATION_META,
    }
  );
};

export default useShowNextFeedbackPrompt;
