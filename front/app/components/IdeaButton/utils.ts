import { MessageDescriptor } from 'react-intl';
import { InputTerm } from 'services/participationContexts';
import { GetPhaseChildProps } from 'resources/GetPhase';
import { IProjectData } from 'services/projects';

import { getInputTermMessage } from 'utils/i18n';
import messages from './messages';

export const getButtonMessage = (
  project: IProjectData,
  phase: GetPhaseChildProps | undefined,
  buttonText: MessageDescriptor | undefined,
  inputTerm: InputTerm
) => {
  if (buttonText) {
    return buttonText;
  } else if (
    project.attributes.participation_method === 'native_survey' ||
    phase?.attributes.participation_method === 'native_survey'
  ) {
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
