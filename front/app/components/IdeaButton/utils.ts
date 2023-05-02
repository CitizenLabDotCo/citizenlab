import { MessageDescriptor } from 'react-intl';
import { InputTerm, ParticipationMethod } from 'services/participationContexts';

import { getInputTermMessage } from 'utils/i18n';
import messages from './messages';

export const getButtonMessage = (
  participationMethod: ParticipationMethod,
  buttonText: MessageDescriptor | undefined,
  inputTerm: InputTerm
) => {
  if (buttonText) {
    return buttonText;
  } else if (participationMethod === 'native_survey') {
    return messages.takeTheSurvey;
  }

  // Add Konveio

  return getInputTermMessage(inputTerm, {
    idea: messages.submitYourIdea,
    option: messages.addAnOption,
    project: messages.addAProject,
    question: messages.addAQuestion,
    issue: messages.submitAnIssue,
    contribution: messages.addAContribution,
  });
};
