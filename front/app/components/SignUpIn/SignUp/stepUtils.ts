// i18n
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { TSignUpStep, TSignUpConfiguration, ILocalState } from './';
import { TAuthUser } from 'hooks/useAuthUser';
import { ISignUpInMetaData } from 'components/SignUpIn';

export function getDefaultSteps(): TSignUpConfiguration {
  return {
    'auth-providers': {
      key: 'auth-providers',
      position: 1,
      stepDescriptionMessage: messages.createYourAccount,
      helperText: (tenant) =>
        tenant?.attributes?.settings?.core?.signup_helper_text,
      isEnabled: () => true,
      isActive: (authUser, metaData, { emailSignUpSelected }) => {
        return (
          isNilOrError(authUser) &&
          !metaData.isInvitation &&
          !emailSignUpSelected
        );
      },
      canTriggerRegistration: false,
    },
    'password-signup': {
      key: 'password-signup',
      position: 2,
      stepDescriptionMessage: messages.createYourAccount,
      helperText: (tenant) =>
        tenant?.attributes?.settings?.core?.signup_helper_text,
      isEnabled: (_, __, { emailSignUpSelected }) => emailSignUpSelected,
      isActive: (authUser, metaData, { emailSignUpSelected }) => {
        if (!isNilOrError(authUser)) return false;
        if (metaData.isInvitation && metaData.token) return true;
        if (emailSignUpSelected) return true;

        return false;
      },
      canTriggerRegistration: false,
    },
    // This step is only needed in the case where the user comes back
    // from SSO, or just refreshed the page during the sign up flow.
    // It is used to check if there are any remaining enabled steps
    // that can trigger registration. If not, it will complete
    // registration already.
    'account-created': {
      key: 'account-created',
      position: 3,
      isEnabled: () => true,
      isActive: (authUser, _, { accountCreated }) => {
        return !isNilOrError(authUser) && !accountCreated;
      },
      canTriggerRegistration: true,
    },
    success: {
      key: 'success',
      position: 7,
      isEnabled: (_, metaData) => !!metaData.inModal,
      isActive: (authUser, metaData) => {
        if (isNilOrError(authUser)) return false;

        return (
          !!authUser.attributes.registration_completed_at && !!metaData.inModal
        );
      },
      canTriggerRegistration: false,
    },
  };
}

const byPosition = (a, b) => a.position - b.position;

export function getActiveStep(
  configuration: TSignUpConfiguration,
  authUser: TAuthUser,
  metaData: ISignUpInMetaData,
  localState: ILocalState
) {
  const stepConfig = Object.values(configuration)
    .sort(byPosition)
    .find((stepConfig) => stepConfig.isActive(authUser, metaData, localState));

  if (!stepConfig) throw new Error('No active step found');

  return stepConfig.key;
}

export function getEnabledSteps(
  configuration: TSignUpConfiguration,
  authUser: TAuthUser,
  metaData: ISignUpInMetaData,
  localState: ILocalState
) {
  return Object.values(configuration)
    .filter((stepConfig) =>
      stepConfig.isEnabled(authUser, metaData, localState)
    )
    .sort(byPosition)
    .map((stepConfig) => stepConfig.key);
}

export function registrationCanBeCompleted(
  lastCompletedStep: TSignUpStep,
  configuration: TSignUpConfiguration,
  authUser: TAuthUser,
  metaData: ISignUpInMetaData,
  localState: ILocalState
) {
  const stepsThatCanTriggerRegistration = Object.values(configuration)
    .filter(
      (stepConfig) =>
        stepConfig.canTriggerRegistration &&
        stepConfig.isEnabled(authUser, metaData, localState)
    )
    .sort(byPosition)
    .map((stepConfig) => stepConfig.key);

  const lastIndex = stepsThatCanTriggerRegistration.length - 1;
  return stepsThatCanTriggerRegistration[lastIndex] === lastCompletedStep;
}

const notSuccessOrAccountCreated = (step: TSignUpStep) =>
  step !== 'success' && step !== 'account-created';

export function getNumberOfSteps(enabledSteps: TSignUpStep[]) {
  const enabledStepsWithoutSuccess = enabledSteps.filter(
    notSuccessOrAccountCreated
  );
  return enabledStepsWithoutSuccess.length;
}

export function getActiveStepNumber(
  activeStep: TSignUpStep,
  enabledSteps: TSignUpStep[]
) {
  const enabledStepsWithoutSuccess = enabledSteps.filter(
    notSuccessOrAccountCreated
  );
  return enabledStepsWithoutSuccess.indexOf(activeStep) + 1;
}
