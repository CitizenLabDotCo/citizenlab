import { SupportedLocale } from 'typings';

import { SchemaResponse } from './types';

export const hasRequiredFields = (
  schemaResponse: SchemaResponse,
  locale: SupportedLocale
) => {
  const { json_schema_multiloc } = schemaResponse.data.attributes;

  return !!json_schema_multiloc[locale]?.required;
};
