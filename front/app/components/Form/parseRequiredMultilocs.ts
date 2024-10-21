import { JsonSchema7 } from '@jsonforms/core';
import { SupportedLocale } from 'typings';

import { FormData } from './typings';

// To handle multilocs we had the two options of adding one control for each multiloc thing : InputMultiloc, WYSIWYGMultiloc, or have the top-level multiloc object be a custom layout that shows the appropriate field and render the controls inside normally. I went for the second option.
// Both options limited somehow the validation power, and with this solution, it means that the errors on the layout level are not available (IE this field is required, or this field should have at least one property). So this is a hacky thing to make the current locale required, but we will have to find something better would we want to make all locales required like in the admin side or simply is we would want to have a cleaner form component.

export const parseRequiredMultilocsSchema = (
  schema: JsonSchema7,
  locale: SupportedLocale
) => {
  const requiredMultilocFields = schema.required?.filter((req) =>
    req.endsWith('_multiloc')
  );
  // requiredMultilocFields can only have elements if schema.required's has, can cast type
  if (requiredMultilocFields && requiredMultilocFields.length > 0) {
    const requiredFieldsObject = Object.fromEntries(
      requiredMultilocFields.map((req) => [
        req,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          ...schema?.properties?.[req],
          required: [locale],
        },
      ])
    );
    return {
      ...schema,
      properties: { ...schema.properties, ...requiredFieldsObject },
    };
  }

  return schema;
};

export const parseRequiredMultilocsData = (
  schema: JsonSchema7,
  locale: SupportedLocale,
  data: FormData
) => {
  const requiredMultilocFields = schema.required?.filter((req) =>
    req.endsWith('_multiloc')
  );

  // requiredMultilocFields can only have elements if schema.required's has, can cast type
  if (requiredMultilocFields && requiredMultilocFields.length > 0) {
    return {
      ...Object.fromEntries(
        requiredMultilocFields.map((req) => [req, { [locale]: '' }])
      ),
      ...data,
    };
  }

  return data;
};
