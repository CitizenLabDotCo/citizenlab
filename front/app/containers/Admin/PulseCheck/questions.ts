import { MessageDescriptor } from 'react-intl';

import { PulseCheckKey } from 'api/pulse_checks/types';

import messages from './messages';

// PulseCheckCard labels every scale "Very hard" to "Very easy", so phrase
// questions as "How easy was it to…".
const questions: Record<PulseCheckKey, MessageDescriptor> = {
  project_setup_ease: messages.projectSetupEaseQuestion,
  return_findability: messages.returnFindabilityQuestion2,
};

export default questions;
