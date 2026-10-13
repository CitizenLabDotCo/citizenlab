import { MessageDescriptor } from 'react-intl';

import { FeedbackPromptKey } from 'api/feedback_prompts/types';

import messages from './messages';

// The question shown for each prompt in the back-end registry
// (FeedbackPrompt::PROMPTS). All prompts use the same 1 (very hard) to
// 7 (very easy) scale, so questions should be phrased as "How easy was it to…".
const questions: Record<FeedbackPromptKey, MessageDescriptor> = {
  project_setup_ease: messages.projectSetupEaseQuestion,
  return_findability: messages.returnFindabilityQuestion,
};

export default questions;
