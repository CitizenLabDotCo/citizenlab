import {
  IIdeaFormSchemas,
  CustomFieldCodes,
} from 'services/ideaCustomFieldsSchemas';
import { Locale } from 'typings';

export default function isFieldEnabled(
  fieldCode: CustomFieldCodes,
  ideaCustomFieldsSchemas: IIdeaFormSchemas,
  locale: Locale
) {
  return (
    ideaCustomFieldsSchemas.ui_schema_multiloc[locale][fieldCode][
      'ui:widget'
    ] !== 'hidden'
  );
}
