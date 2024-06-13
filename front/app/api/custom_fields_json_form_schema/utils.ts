import { SupportedLocale } from 'typings';

import { SchemaResponse } from './types';

export const hasRequiredFields = (
  schemaResponse: SchemaResponse,
  locale: SupportedLocale
) => {
  return !!schemaResponse.data.attributes?.json_schema_multiloc[locale]
    ?.required;
};
