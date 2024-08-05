import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';
import { SupportedPermittedBy } from './typings';

const removeNull = (
  array: (MessageDescriptor | null)[]
): MessageDescriptor[] => {
  return array.filter((el) => el !== null) as MessageDescriptor[];
};

// Visualization steps
const getNoneVisualizationSteps = (
  _permissionsFields: IPermissionsCustomFieldData[]
) => {
  return [messages.noActionsAreRequired];
};

const getConfirmedEmailVisualizationSteps = (
  permissionsFields: IPermissionsCustomFieldData[]
) => {
  const customFieldsStep =
    permissionsFields.length > 0
      ? messages.completeTheExtraQuestionsBelow
      : null;

  return removeNull([
    messages.enterYourEmail,
    messages.confirmYourEmail,
    customFieldsStep,
  ]);
};

const getUsersVisualizationSteps = (
  permissionsFields: IPermissionsCustomFieldData[]
) => {
  const customFieldsStep =
    permissionsFields.length > 0
      ? messages.completeTheExtraQuestionsBelow
      : null;

  return removeNull([
    messages.enterNameLastNameEmailAndPassword,
    messages.confirmYourEmail,
    customFieldsStep,
  ]);
};

const getVerifiedVisualiationSteps = (
  permissionsFields: IPermissionsCustomFieldData[]
) => {
  const customFieldsStep =
    permissionsFields.length > 0
      ? messages.completeTheExtraQuestionsBelow
      : null;

  return removeNull([
    messages.authenticateWithVerificationProvider,
    customFieldsStep,
  ]);
};

export const VISUALIZATION_STEPS: Record<
  SupportedPermittedBy,
  (permissionsFields: IPermissionsCustomFieldData[]) => MessageDescriptor[]
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
