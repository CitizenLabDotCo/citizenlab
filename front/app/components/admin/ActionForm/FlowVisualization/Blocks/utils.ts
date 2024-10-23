import { FormatMessage } from 'typings';

import { MethodMetadata } from 'api/verification_methods/types';

import { Localize } from 'hooks/useLocalize';

import messages from './messages';

export const getReturnedFieldsPreview = (
  verificationMethodMetadata: MethodMetadata,
  localize: Localize
) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!verificationMethodMetadata) return null;

  const {
    locked_attributes,
    other_attributes,
    locked_custom_fields,
    other_custom_fields,
  } = verificationMethodMetadata;

  const allAttributes = [
    ...locked_attributes,
    ...other_attributes,
    ...locked_custom_fields,
    ...other_custom_fields,
  ];

  if (allAttributes.length === 0) {
    return null;
  }

  if (allAttributes.length === 1) {
    return localize(allAttributes[0]);
  }

  if (allAttributes.length === 2) {
    return `${localize(allAttributes[0])} & ${localize(allAttributes[1])}`;
  }

  return `${localize(allAttributes[0])}, ${localize(allAttributes[1])}, ...`;
};

export const getVerifiedDataList = (
  verificationMethodMetadata: MethodMetadata,
  localize: Localize
) => {
  const {
    locked_attributes,
    other_attributes,
    locked_custom_fields,
    other_custom_fields,
  } = verificationMethodMetadata;

  const allAttributes = [
    ...locked_attributes.map((attribute) => ({
      label: localize(attribute),
      locked: true,
    })),
    ...other_attributes.map((attribute) => ({
      label: localize(attribute),
      locked: false,
    })),
    ...locked_custom_fields.map((attribute) => ({
      label: localize(attribute),
      locked: true,
    })),
    ...other_custom_fields.map((attribute) => ({
      label: localize(attribute),
      locked: false,
    })),
  ];

  return allAttributes;
};

export const enabledSteps = (...stepsEnabled: boolean[]) => {
  return stepsEnabled.filter((stepEnabled) => stepEnabled).length;
};

export const getVerificationFrequencyExplanation = (
  verificationExpiry: number | null,
  formatMessage: FormatMessage
) => {
  if (verificationExpiry === null) {
    return null;
  }

  if (verificationExpiry === 0) {
    return formatMessage(messages.verificationFlowVizExplanation30Min);
  }

  return formatMessage(messages.verificationFlowVizExplanationXDays, {
    days: verificationExpiry,
  });
};
