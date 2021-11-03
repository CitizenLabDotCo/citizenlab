import { MutableRefObject } from 'react';

// i18n
import messages from './messages';

// utils
import { indexOf } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// typings
import {
  TSignUpStep,
  TSignUpStepConfiguration,
  TSignUpStepConfigurationObject,
} from './';
import { TAuthUser } from 'hooks/useAuthUser';

export function getDefaultSteps(formatMessage): TSignUpStepConfiguration {
  return {
    'auth-providers': {
      position: 1,
      stepName: formatMessage(messages.createYourAccount),
      helperText: (tenant) =>
        tenant?.attributes?.settings?.core?.signup_helper_text,
      isEnabled: (metaData) => !metaData?.isInvitation,
      isActive: (authUser) => !authUser,
    },
    'password-signup': {
      position: 2,
      stepName: formatMessage(messages.createYourAccount),
      helperText: (tenant) =>
        tenant?.attributes?.settings?.core?.signup_helper_text,
      isEnabled: () => true,
      isActive: (authUser) => !authUser,
    },
    success: {
      position: 6,
      isEnabled: (metaData) => !!metaData?.inModal,
      isActive: (authUser) => !!authUser?.attributes?.registration_completed_at,
    },
  };
}

export function getNextStep(
  authUserRef: MutableRefObject<TAuthUser>,
  activeStepRef: MutableRefObject<TSignUpStep | null>,
  enabledSteps: TSignUpStep[],
  configuration
) {
  const authUserValue = !isNilOrError(authUserRef.current)
    ? authUserRef.current
    : undefined;
  const startFromIndex = indexOf(enabledSteps, activeStepRef.current) + 1;
  const stepsToCheck = enabledSteps.slice(startFromIndex);
  const step = stepsToCheck.find((step) =>
    configuration?.[step]?.isActive?.(authUserValue)
  );
  return step;
}

export function getEnabledSteps(
  configuration: TSignUpStepConfiguration,
  metaData,
  completedSteps: TSignUpStep[]
) {
  return Object.entries(configuration)
    .reduce(
      (
        acc,
        [key, configuration]: [TSignUpStep, TSignUpStepConfigurationObject]
      ) => {
        if (!completedSteps.includes(key) && !configuration.isEnabled(metaData))
          return acc;

        return [...acc, { id: key, position: configuration.position }];
      },
      []
    )
    .sort((a, b) => a.position - b.position)
    .map(({ id }) => id);
}

export function getNumberOfSteps(
  enabledSteps: TSignUpStep[],
  configuration: TSignUpStepConfiguration,
  activeStepConfiguration?: TSignUpStepConfigurationObject
) {
  // base the steps on the stepName (grouping)
  const uniqueSteps = [
    ...new Set(
      enabledSteps
        .map((step: TSignUpStep) => configuration[step]?.stepName)
        .filter((v) => v !== undefined)
    ),
  ];
  return [
    indexOf(uniqueSteps, activeStepConfiguration?.stepName) > -1
      ? indexOf(uniqueSteps, activeStepConfiguration?.stepName) + 1
      : 1,
    uniqueSteps.length,
  ];
}
