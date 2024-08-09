import { SupportedLocale } from 'typings';

import { SchemaResponse } from './types';

export const hasRequiredFields = (
  schemaResponse: SchemaResponse,
  locale: SupportedLocale
) => {
  const requiredFields =
    schemaResponse.data.attributes.json_schema_multiloc[locale]?.required;

  if (!requiredFields) {
    return false;
  }

  return requiredFields.length > 0;
};
