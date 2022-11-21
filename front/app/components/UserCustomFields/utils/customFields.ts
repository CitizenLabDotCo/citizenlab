import { isEmpty, get, forOwn } from 'lodash-es';

export function hasCustomFields(customFieldsSchemas, locale) {
  // TODO
  let hasCustomFields = false;
  const customFieldNames = get(
    customFieldsSchemas,
    `json_schema_multiloc.${locale}.properties`,
    null
  );

  if (!isEmpty(customFieldNames)) {
    forOwn(customFieldNames, (_value, fieldName) => {
      const uiWidget = get(
        customFieldsSchemas,
        `ui_schema_multiloc.${locale}.${fieldName}.${'ui:widget'}`,
        null
      );

      if (uiWidget !== 'hidden') {
        hasCustomFields = true;
      }
    });
  }

  return hasCustomFields;
}
