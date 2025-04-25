import { JsonSchema } from '@jsonforms/core';

import { getFieldNameFromPath } from 'utils/JSONFormUtils';

import { FormValues, PageType } from '../typings';

import removeRequiredOtherFields from './removeRequiredOtherFields';

// This function is used to extract a subset of a JSON schema based on a
// specific page. It filters the schema's properties and required fields
// to include only those relevant to a given page.
const getPageSchema = (
  schema: JsonSchema,
  pageCategorization: PageType,
  data: FormValues
): JsonSchema => {
  const currentPageElementNames = pageCategorization.elements.map(
    (uiSchemaElement) => getFieldNameFromPath(uiSchemaElement.scope)
  );

  const required = (schema.required || []).filter((requiredElementName) =>
    currentPageElementNames.includes(requiredElementName)
  );

  const properties = {};
  Object.entries(schema.properties || {}).forEach(([key, value]) => {
    if (currentPageElementNames.includes(key)) {
      properties[key] = value;
    }
  });

  return removeRequiredOtherFields(
    {
      ...schema,
      required,
      properties,
    },
    data
  );
};

export default getPageSchema;
