// i18n
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import {
  TSignUpStep,
  TSignUpConfiguration,
  TSignUpStepConfigurationObject,
  ILocalState,
} from '.';
import { TAuthUser } from 'hooks/useAuthUser';
import { ISignUpInMetaData } from 'events/openSignUpInModal';
import { UserCustomFieldsInfos } from 'services/userCustomFields';

export function getDefaultSteps(
  userCustomFieldsSchema: UserCustomFieldsInfos
): TSignUpConfiguration {
  return {
    'auth-providers': {
      key: 'auth-providers',
      position: 1,
      stepDescriptionMessage: messages.createYourAccount,
      helperText: (tenant) =>
        tenant?.attributes.settings.core.signup_helper_text,
      isEnabled: () => true,
      isActive: (authUser, metaData, { emailSignUpSelected }) => {
        return (
          // only possible if not logged in
          isNilOrError(authUser) &&
          // if an invitation was used: go straight to password-signup
          !metaData.isInvitation &&
          // should be skipped if user already chose password-signup
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
        tenant?.attributes.settings.core.signup_helper_text,
      isEnabled: (_, __, { emailSignUpSelected }) => emailSignUpSelected,
      isActive: (authUser, metaData, { emailSignUpSelected }) => {
        // only possibel if not logged in
        if (!isNilOrError(authUser)) return false;
        // if an invitation was used: this is the step where you should end up
        if (metaData.isInvitation) return true;
        // or, if the user chose password-signup manually
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
        // We also check for authUser here,
        // because we might be returning from a page refresh
        // or SSO here, but not have the authUser data yet
        // from the API. In that case, this step would
        // execute prematurely
        return !isNilOrError(authUser) && !accountCreated;
      },
      canTriggerRegistration: true,
    },
    confirmation: {
      key: 'confirmation',
      position: 4,
      stepDescriptionMessage: messages.confirmYourAccount,
      isEnabled: (authUser) => {
        return userEmailToBeConfirmed(authUser);
      },
      isActive: userEmailToBeConfirmed,
      canTriggerRegistration: true,
    },
    verification: {
      key: 'verification',
      position: 5,
      stepDescriptionMessage: messages.verifyYourIdentity,
      isEnabled: (_, metaData) => !!metaData.verification,
      isActive: (authUser, metaData) => {
        if (isNilOrError(authUser)) return false;
        const flowHasVerificationStep = !!metaData.verification;
        return flowHasVerificationStep && !authUser.attributes.verified;
      },
      canTriggerRegistration: true,
    },
    'custom-fields': {
      key: 'custom-fields',
      position: 6,
      stepDescriptionMessage: messages.completeYourProfile,
      helperText: (tenant) =>
        tenant?.attributes.settings.core.custom_fields_signup_helper_text,
      isEnabled: () => customFieldsEnabled(userCustomFieldsSchema),
      isActive: (authUser) => {
        if (isNilOrError(authUser)) return false;
        if (authUser.attributes.registration_completed_at) return false;

        return customFieldsEnabled(userCustomFieldsSchema);
      },
      canTriggerRegistration: true,
    },
    success: {
      key: 'success',
      position: 7,
      isEnabled: () => true,
      isActive: (authUser) => {
        if (isNilOrError(authUser)) return false;

        return !!authUser.attributes.registration_completed_at;
      },
      canTriggerRegistration: false,
    },
  };
}

const byPosition = (
  a: TSignUpStepConfigurationObject,
  b: TSignUpStepConfigurationObject
) => a.position - b.position;

const userEmailToBeConfirmed = (authUser: TAuthUser) => {
  return !isNilOrError(authUser) && authUser.attributes.confirmation_required;
};

const customFieldsEnabled = (userCustomFieldsSchema: UserCustomFieldsInfos) =>
  userCustomFieldsSchema.hasRequiredFields ||
  userCustomFieldsSchema.hasCustomFields;

export function getActiveStep(
  configuration: TSignUpConfiguration,
  authUser: TAuthUser,
  metaData: ISignUpInMetaData,
  localState: ILocalState
) {
  const stepConfig = Object.values(configuration)
    .sort(byPosition)
    .find((stepConfig) => stepConfig.isActive(authUser, metaData, localState));

  // There can be no stepConfig- that means that we are still waiting for
  // something, like the confirmation being completed but authUser
  // not having come back yet
  if (!stepConfig) return null;

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
