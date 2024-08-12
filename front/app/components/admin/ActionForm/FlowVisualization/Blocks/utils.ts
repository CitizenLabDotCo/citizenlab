import { ActionMetadata } from 'api/verification_methods/types';

import { Localize } from 'hooks/useLocalize';

export const getReturnedFieldsPreview = (
  verificationActionMetadata: ActionMetadata | undefined,
  localize: Localize
) => {
  if (!verificationActionMetadata) return null;

  const {
    locked_attributes,
    other_attributes,
    locked_custom_fields,
    other_custom_fields,
  } = verificationActionMetadata;

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
  verificationActionMetadata: ActionMetadata,
  localize: Localize
) => {
  const {
    locked_attributes,
    other_attributes,
    locked_custom_fields,
    other_custom_fields,
  } = verificationActionMetadata;

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
