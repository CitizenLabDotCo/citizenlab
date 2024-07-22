import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';
import { SupportedPermittedBy } from './typings';

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

const getCustomVisualiationSteps = () => {
  return [
    messages.authenticateWithVerificationProvider,
    messages.completeTheExtraQuestionsBelow,
  ];
};

export const VISUALIZATION_STEPS: Record<
  SupportedPermittedBy,
  () => MessageDescriptor[]
> = {
  users: getUsersVisualizationSteps,
  everyone_confirmed_email: getConfirmedEmailVisualizationSteps,
  custom: getCustomVisualiationSteps,
};

const SUPPORTED_PERMITTED_BY: Set<SupportedPermittedBy> = new Set([
  'users',
  'everyone_confirmed_email',
  'custom',
]);

export const isSupportedPermittedBy = (
  permittedBy: string
): permittedBy is SupportedPermittedBy => {
  return SUPPORTED_PERMITTED_BY.has(permittedBy as any);
};
