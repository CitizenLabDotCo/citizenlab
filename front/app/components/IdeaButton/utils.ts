import { InputTerm, ParticipationMethod } from 'services/participationContexts';

import { getInputTermMessage } from 'utils/i18n';
import messages from './messages';

export const getButtonMessage = (
  participationMethod: ParticipationMethod,
  inputTerm: InputTerm
) => {
  if (participationMethod === 'native_survey') {
    return messages.takeTheSurvey;
  }

  // Add Konveio after BE?

  return getInputTermMessage(inputTerm, {
    idea: messages.submitYourIdea,
    option: messages.addAnOption,
    project: messages.addAProject,
    question: messages.addAQuestion,
    issue: messages.submitAnIssue,
    contribution: messages.addAContribution,
  });
};
