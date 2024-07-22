import { SupportedPermittedBy } from './typings';

const getConfirmedEmailVisualizationSteps = () => {
  return [
    'Enter your email',
    'Confirm your email',
    'Complete the extra questions below',
  ];
};

const getUsersVisualizationSteps = () => {
  return [
    'Enter name, last name, email and password',
    'Confirm your email',
    'Complete the extra questions below',
  ];
};

const getCustomVisualiationSteps = () => {
  return ['Authenticate with MitID', 'Complete the extra questions below'];
};

export const VISUALIZATION_STEPS: Record<SupportedPermittedBy, () => string[]> =
  {
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
