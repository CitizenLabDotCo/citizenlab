import { SchemaResponse } from './types';
import { Locale } from 'typings';

export const hasRequiredFields = (
  schemaResponse: SchemaResponse,
  locale: Locale
) => {
  const { json_schema_multiloc } = schemaResponse.data.attributes;

  return !!json_schema_multiloc[locale]?.required;
};
