import { SupportedLocale } from 'typings';

import { SchemaResponse } from './types';

export const hasRequiredNonLockedFields = (
  schemaResponse: SchemaResponse,
  locale: SupportedLocale
) => {
  const requiredFields =
    schemaResponse.data.attributes.json_schema_multiloc[locale]?.required;

  if (!requiredFields) {
    return false;
  }

  if (requiredFields.length === 0) {
    return false;
  }

  // So now we know that we have required fields.
  // But we still need to check if they are locked or not.
  // If all of them are locked, we return false

  const uiSchema = schemaResponse.data.attributes.ui_schema_multiloc[locale];
  const elements = uiSchema?.elements;

  if (!elements) return false;

  const allFieldsAreLocked = requiredFields.every((fieldName) => {
    // Unfortunately I need to typecast this element to any, because the jsonforms types are incorrect
    const fieldUiSchema = elements.find(
      (element: any) => element.scope === `#/properties/${fieldName}`
    );
    if (!fieldUiSchema) return false;

    return !!fieldUiSchema.options?.verificationLocked;
  });

  return !allFieldsAreLocked;
};
