import {
  TSignUpStep,
  TSignUpStepConfiguration,
  TSignUpStepConfigurationObject,
} from './';

export function getEnabledSteps(
  configuration: TSignUpStepConfiguration,
  metaData
) {
  return Object.entries(configuration)
    .reduce(
      (
        acc,
        [key, configuration]: [TSignUpStep, TSignUpStepConfigurationObject]
      ) => {
        if (!configuration.isEnabled(metaData)) return acc;
        return [...acc, { id: key, position: configuration.position }];
      },
      []
    )
    .sort((a, b) => a.position - b.position)
    .map(({ id }) => id);
}
