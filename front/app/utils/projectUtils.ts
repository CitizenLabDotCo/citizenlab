import {
  IIdeaJsonFormSchemas,
  CustomFieldCodes,
} from 'api/idea_json_form_schema/types';
import { Locale } from 'typings';
import { isNilOrError } from './helperUtils';

export function isFieldEnabled(
  fieldCode: CustomFieldCodes,
  ideaCustomFieldsSchemas:
    | IIdeaJsonFormSchemas['data']['attributes']
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
