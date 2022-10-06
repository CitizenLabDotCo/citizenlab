import {
  IIdeaFormSchemas,
  CustomFieldCodes,
} from 'services/ideaCustomFieldsSchemas';
import { IIdeaJsonFormSchemas } from 'services/ideaJsonFormsSchema';
import { Locale } from 'typings';

export default function isFieldEnabled(
  fieldCode: CustomFieldCodes,
  ideaCustomFieldsSchemas: IIdeaFormSchemas,
  locale: Locale
) {
  return (
    ideaCustomFieldsSchemas.ui_schema_multiloc[locale][fieldCode]?.[
      'ui:widget'
    ] !== 'hidden'
  );
}

// TODO: Remove when we remove associated feature flags. Temporary solution for handling both cases right now.
export const checkFieldEnabled = (
  fieldName: CustomFieldCodes,
  ideaCustomFieldsSchemas: IIdeaFormSchemas | IIdeaJsonFormSchemas,
  locale: Locale,
  ideaCustomFieldsIsEnabled: any,
  dynamicIdeaFormIsEnabled: any
) => {
  let fieldEnabled;
  if (!ideaCustomFieldsIsEnabled || !dynamicIdeaFormIsEnabled) {
    fieldEnabled = isFieldEnabled(
      fieldName,
      ideaCustomFieldsSchemas as IIdeaFormSchemas,
      locale
    );
  } else {
    const schema = ideaCustomFieldsSchemas as IIdeaJsonFormSchemas;
    const jsonmultiloc = schema.json_schema_multiloc[locale];
    if (jsonmultiloc) {
      fieldEnabled = jsonmultiloc.properties[fieldName];
    }
  }
  return fieldEnabled;
};
