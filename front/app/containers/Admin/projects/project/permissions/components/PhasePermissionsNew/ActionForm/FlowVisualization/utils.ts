import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';
import { SupportedPermittedBy } from './typings';

const getNoneVisualizationSteps = () => {
  return [messages.noActionsAreRequired];
};

const getConfirmedEmailVisualizationSteps = () => {
  return [
    messages.enterYourEmail,
    messages.confirmYourEmail,
    messages.completeTheExtraQuestionsBelow,
  ];
};

const getUsersVisualizationSteps = () => {
  return [
    messages.enterNameLastNameEmailAndPassword,
    messages.confirmYourEmail,
    messages.completeTheExtraQuestionsBelow,
  ];
};

const getVerifiedVisualiationSteps = () => {
  return [
    messages.authenticateWithVerificationProvider,
    messages.completeTheExtraQuestionsBelow,
  ];
};

export const VISUALIZATION_STEPS: Record<
  SupportedPermittedBy,
  () => MessageDescriptor[]
> = {
  everyone: getNoneVisualizationSteps,
  users: getUsersVisualizationSteps,
  everyone_confirmed_email: getConfirmedEmailVisualizationSteps,
  verified: getVerifiedVisualiationSteps,
};

const SUPPORTED_PERMITTED_BY: Set<SupportedPermittedBy> = new Set([
  'everyone',
  'users',
  'everyone_confirmed_email',
  'verified',
]);

export const isSupportedPermittedBy = (
  permittedBy: string
): permittedBy is SupportedPermittedBy => {
  return SUPPORTED_PERMITTED_BY.has(permittedBy as any);
};
