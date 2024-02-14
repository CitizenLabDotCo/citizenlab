import {
  and,
  isCategorization,
  JsonSchema,
  Layout,
  Tester,
  uiTypeIs,
} from '@jsonforms/core';
import Ajv from 'ajv';
import { forOwn, isEmpty } from 'lodash-es';
import {
  ExtendedRule,
  ExtendedUISchema,
  extractElementsByOtherOptionLogic,
  isVisible,
} from '../Controls/visibilityUtils';

export interface PageType extends Layout {
  type: 'Page';
  options: {
    id?: string;
    title?: string;
    description?: string;
  };
  label?: string;
  scope?: string;
  ruleArray?: ExtendedRule[];
  elements: ExtendedUISchema[];
}

export interface PageCategorization extends ExtendedUISchema {
  type: 'Categorization';
  /**
   * The label of this categorization.
   */
  label: string;
  /**
   * The child elements of this categorization which are either of type
   * {@link PageType}.
   */
  elements: (PageType | PageCategorization)[];
}

export const keyPresentInPageRoute = (
  key: string,
  userPageRoute: PageType[]
) => {
  let isFound = false;
  userPageRoute.forEach((page) => {
    const currentPageElementNames = page.elements.map((uiSchemaElement) =>
      uiSchemaElement.scope.split('/').pop()
    );
    isFound ||= currentPageElementNames.includes(key);
  });
  return isFound;
};

export const getFilteredDataForUserPath = (
  userRoute: PageType[],
  data: any
) => {
  const filteredData = { data };
  forOwn(data, (value, key) => {
    filteredData.data[key] = keyPresentInPageRoute(key, userRoute)
      ? value
      : undefined;
  });
  return filteredData;
};

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
  pageCategorization: PageType,
  data: any,
  ajv: Ajv
) => {
  const currentPageElementNames = pageCategorization.elements.map(
    (uiSchemaElement) => uiSchemaElement.scope.split('/').pop()
  );

  const pageSchemaProperties = {};
  Object.entries(schema.properties || {}).forEach(([key, value]) => {
    if (currentPageElementNames.includes(key)) {
      pageSchemaProperties[key] = value;
    }
  });

  const hiddenElements = pageCategorization.elements
    .filter((pageElement) => pageElement.ruleArray)
    .filter((pageElementWithRule) => {
      return !isVisible(pageElementWithRule, data, '', ajv);
    })
    .concat(extractElementsByOtherOptionLogic(pageCategorization, data, true))
    .map((element) => element['scope'].split('/').pop());

  const pageSchema = Object.assign({}, schema, {
    required: (schema.required || [])
      .filter((requiredElementName) =>
        currentPageElementNames.includes(requiredElementName)
      )
      .filter((requiredElement) => !hiddenElements.includes(requiredElement)),
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
