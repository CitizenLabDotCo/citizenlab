import { JsonSchema } from '@jsonforms/core';

import { PageType } from '../typings';

const getPageSchema = (
  schema: JsonSchema,
  pageCategorization: PageType
): JsonSchema => {
  const currentPageElementNames = pageCategorization.elements.map(
    (uiSchemaElement) => uiSchemaElement.scope.split('/').pop()
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

  return {
    ...schema,
    required,
    properties,
  };
};

export default getPageSchema;
