import { forOwn, isEmpty } from 'lodash-es';
import {
  and,
  isCategorization,
  JsonSchema,
  Layout,
  Tester,
  UISchemaElement,
  uiTypeIs,
} from '@jsonforms/core';

export interface PageType extends Layout {
  type: 'Page';
  /**
   * The label associated with this category layout.
   */

  options: {
    title: string;
    description: string;
  };
}

export interface PageCategorization extends UISchemaElement {
  type: 'Categorization';
  /**
   * The label of this categorization.
   */
  label: string;
  /**
   * The child elements of this categorization which are either of type
   * {@link PageType}.
   */
  elements: PageType[];
}

export const getSanitizedFormData = (data) => {
  const sanitizedFormData = {};
  forOwn(data, (value, key) => {
    sanitizedFormData[key] =
      value === null || value === '' || value === false ? undefined : value;
  });

  return sanitizedFormData;
};

export const getPageSchema = (
  schema: JsonSchema,
  pageCategorization: PageCategorization | PageType
) => {
  const currentPageElementNames: string[] = pageCategorization.elements.map(
    (e) => e.scope.split('/').pop()
  );

  const pageSchemaProperties = {};
  Object.entries(schema.properties || {}).forEach(([key, value]) => {
    if (currentPageElementNames.includes(key)) {
      pageSchemaProperties[key] = value;
    }
  });

  const pageSchema = Object.assign({}, schema, {
    required: (schema.required || []).filter((requiredElementName) =>
      currentPageElementNames.includes(requiredElementName)
    ),
    properties: pageSchemaProperties,
  });

  return pageSchema;
};

export const isPageCategorization: Tester = and(
  uiTypeIs('Categorization'),
  (uischema) => {
    const hasPage = (element: PageCategorization): boolean => {
      if (isEmpty(element.elements)) {
        return false;
      }

      return element.elements
        .map((elem) =>
          isCategorization(elem) ? hasPage(elem) : elem.type === 'Page'
        )
        .reduce((prev, curr) => prev && curr, true);
    };

    return hasPage(uischema as PageCategorization);
  }
);
