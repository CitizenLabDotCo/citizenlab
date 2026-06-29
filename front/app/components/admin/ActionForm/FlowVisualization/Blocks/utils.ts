
import { MethodMetadata } from 'api/id_methods/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';

import { Localize } from 'hooks/useLocalize';

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

export const getNumberOfVerificationLockedItems = (
  fields: IPermissionsPhaseCustomFieldData[]
) => {
  return fields.filter(({ attributes }) => attributes.lock === 'verification')
    .length;
};

