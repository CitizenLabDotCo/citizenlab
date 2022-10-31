import {
  CustomFieldCodes,
  IIdeaFormSchemas,
} from 'services/ideaCustomFieldsSchemas';
import { IIdeaJsonFormSchemas } from 'services/ideaJsonFormsSchema';
import { Locale } from 'typings';
import { isNilOrError } from './helperUtils';

export function isFieldEnabled(
  fieldCode: CustomFieldCodes,
  ideaCustomFieldsSchemas:
    | IIdeaFormSchemas
    | IIdeaJsonFormSchemas
    | undefined
    | null
    | Error,
  locale: Locale | undefined | Error | null
): boolean {
  if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
    return !!ideaCustomFieldsSchemas.json_schema_multiloc?.[locale]
      ?.properties?.[fieldCode];
  }

  return true;
}
