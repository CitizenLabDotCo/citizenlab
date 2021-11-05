// i18n
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { TSignUpStep, TSignUpConfiguration, ILocalState } from './';
import { TAuthUser } from 'hooks/useAuthUser';
import { ISignUpInMetaData } from 'components/SignUpIn';

export function getDefaultSteps(formatMessage): TSignUpConfiguration {
  return {
    'auth-providers': {
      key: 'auth-providers',
      position: 1,
      stepName: formatMessage(messages.createYourAccount),
      helperText: (tenant) =>
        tenant?.attributes?.settings?.core?.signup_helper_text,
      isEnabled: () => false,
      isActive: (authUser, metaData, { emailSignUpSelected }) => {
        return (
          isNilOrError(authUser) &&
          !metaData.isInvitation &&
          !emailSignUpSelected
        );
      },
    },
    'password-signup': {
      key: 'password-signup',
      position: 2,
      stepName: formatMessage(messages.createYourAccount),
      helperText: (tenant) =>
        tenant?.attributes?.settings?.core?.signup_helper_text,
      isEnabled: (_, __, { emailSignUpSelected }) =>
        emailSignUpSelected === true,
      isActive: (authUser, metaData, { emailSignUpSelected }) => {
        if (isNilOrError(authUser)) {
          if (metaData.isInvitation && metaData.token) return true;
          if (emailSignUpSelected) return true;
        }

        return false;
      },
    },
    success: {
      key: 'success',
      position: 6,
      isEnabled: (_, metaData) => !!metaData.inModal,
      isActive: (authUser, metaData) => {
        if (isNilOrError(authUser)) return false;

        return (
          !!authUser.attributes.registration_completed_at && !!metaData.inModal
        );
      },
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

export function getNumberOfSteps(
  enabledSteps: TSignUpStep[],
  configuration: TSignUpConfiguration,
  activeStep: TSignUpStep
) {
  // base the steps on the stepName (grouping)
  // const uniqueSteps = [
  //   ...new Set(
  //     enabledSteps
  //       .map((step: TSignUpStep) => configuration[step]?.stepName)
  //       .filter((v) => v !== undefined)
  //   ),
  // ];
  // return [
  //   indexOf(uniqueSteps, activeStepConfiguration?.stepName) > -1
  //     ? indexOf(uniqueSteps, activeStepConfiguration?.stepName) + 1
  //     : 1,
  //   uniqueSteps.length,
  // ];
}
