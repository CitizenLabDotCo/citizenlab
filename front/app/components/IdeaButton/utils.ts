import { InputTerm } from 'utils/participationContexts';
import { Props } from '.';
import { getInputTermMessage } from 'utils/i18n';
import messages from './messages';

export const getButtonMessage = (
  participationMethod: Props['participationMethod'],
  inputTerm: InputTerm
) => {
  if (participationMethod === 'native_survey') {
    return messages.takeTheSurvey;
  }

  return getInputTermMessage(inputTerm, {
    idea: messages.submitYourIdea,
    option: messages.addAnOption,
    project: messages.addAProject,
    question: messages.addAQuestion,
    issue: messages.submitAnIssue,
    contribution: messages.addAContribution,
  });
};
