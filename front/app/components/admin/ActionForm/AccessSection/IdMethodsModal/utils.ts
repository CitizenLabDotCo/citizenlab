// Turning the raw id methods into what the modal shows: the *active* ones
// (authentication and/or verification — both kinds can return fields) and the
// fields each of them hands back.

import { IdMethodData, IdMethods, MethodMetadata } from 'api/id_methods/types';

import { Localize } from 'hooks/useLocalize';

export interface Field {
  label: string;
  locked: boolean;
}

const isActive = (method: IdMethodData) =>
  method.attributes.authentication_method ||
  method.attributes.verification_method;

/** Every method that is currently in use. */
export const getActiveMethods = (
  idMethods: IdMethods | undefined
): IdMethodData[] => (idMethods?.data ?? []).filter(isActive);

/**
 * The fields a method hands back. Locked ones come straight from the official
 * register; the rest the participant can still edit.
 */
export const getFields = (
  metadata: MethodMetadata | undefined,
  localize: Localize
): Field[] => {
  if (!metadata) return [];

  return [
    ...metadata.locked_attributes.map((m) => ({
      label: localize(m),
      locked: true,
    })),
    ...metadata.locked_custom_fields.map((m) => ({
      label: localize(m),
      locked: true,
    })),
    ...metadata.other_attributes.map((m) => ({
      label: localize(m),
      locked: false,
    })),
    ...metadata.other_custom_fields.map((m) => ({
      label: localize(m),
      locked: false,
    })),
  ];
};
