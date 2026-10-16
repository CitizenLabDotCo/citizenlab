import { MessageDescriptor } from 'react-intl';

import { FeedbackPromptKey } from 'api/feedback_prompts/types';

import messages from './messages';

// PromptCard labels every scale "Very hard" to "Very easy", so phrase questions
// as "How easy was it to…".
const questions: Record<FeedbackPromptKey, MessageDescriptor> = {
  project_setup_ease: messages.projectSetupEaseQuestion,
  return_findability: messages.returnFindabilityQuestion2,
};

export default questions;
