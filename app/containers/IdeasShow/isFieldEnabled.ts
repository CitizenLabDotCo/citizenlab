import {
  IIdeaCustomFieldsSchemas,
  CustomFieldCodes,
} from 'services/ideaCustomFields';
import { Locale } from 'typings';

export default function isFieldEnabled(
  fieldCode: CustomFieldCodes,
  ideaCustomFieldsSchemas: IIdeaCustomFieldsSchemas,
  locale: Locale
) {
  return (
    ideaCustomFieldsSchemas.ui_schema_multiloc[locale][fieldCode][
      'ui:widget'
    ] !== 'hidden'
  );
}
