/*
 Reference for some of the code in this file: https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/testers/testers.ts
 *
*/
import {
  Condition,
  SchemaBasedCondition,
  Scopable,
  composeWithUi,
  resolveData,
  JsonSchema,
} from '@jsonforms/core';

import { HidePageCondition, PageType } from 'components/Form/typings';
import customAjv from 'components/Form/utils/customAjv';
import getOtherControlKey from 'components/Form/utils/getOtherControlKey';

const getVisiblePages = (pages: PageType[], data: Record<string, any>) => {
  return pages.filter((page) => isVisible(page, data, pages));
};

export default getVisiblePages;

const isVisible = (
  page: PageType,
  data: Record<string, any>,
  pages: PageType[]
): boolean => {
  if (page.ruleArray) {
    return evalVisibility(page, data, pages);
  }

  const otherControlKey = getOtherControlKey(page.scope);

  return otherControlKey ? data[otherControlKey] === 'other' : true;
};

const evalVisibility = (
  page: PageType,
  data: any,
  pages: PageType[]
): boolean => {
  if (!page.ruleArray || page.ruleArray.length === 0) {
    return true;
  }

  return page.ruleArray.every((currentRule) => {
    // Question rule takes precedence over page rule
    // if (isHidePageCondition(currentRule.condition) && !hasQuestionRule) {
    //   return pageWithId ? !isVisible(pageWithId, data, pages) : false;
    // }

    // if (isHidePageCondition(currentRule.condition)) {
    //   return true;
    // }

    // If the rule only has a page condition:
    if (isHidePageCondition(currentRule.condition)) {
      // We find the page that causes the current condition
      // E.g. if this page is page 3, and page 2 says "Go to page 4",
      // then page 2 causes the hide condition on page 3
      const pageThatCausedCondition = pages.find(
        (page) => page.options.id === currentRule.condition.pageId
      );

      if (!pageThatCausedCondition) throw new Error('Page not found'); // should not be possible

      // Then we check if the page that causes the condition has a question rule
      const pageThatCausedConditionHasQuestionRule =
        pageThatCausedCondition.elements.find(
          (element) => element.options?.hasRule
        );

      if (pageThatCausedConditionHasQuestionRule) {
        return true;
      } else {
        return !isVisible(pageThatCausedCondition, data, pages);
      }
    }

    // If the rule only has a question condition:
    const shouldHide = evaluateCondition(data, currentRule.condition);
    const visible = !shouldHide;

    return visible;
  });
};

const isHidePageCondition = (
  condition: Condition
): condition is HidePageCondition => condition.type === 'HIDEPAGE';

const getConditionScope = (condition: Scopable): string => {
  return composeWithUi(condition, '');
};

/**
 * Validates a schema condition.
 * Handles both single values and arrays of values.
 *
 * @param value - The resolved value to validate (single or array).
 * @param schema - The JSON schema to validate against.
 * @param ajv - The AJV instance for validation.
 * @returns {boolean} - True if the value or any array item matches the schema.
 */
const validateSchemaCondition = (value: any, schema: JsonSchema): boolean => {
  if (Array.isArray(value)) {
    // For arrays, check if at least one element passes validation. Important for multi-select and image-select
    return value.some((val) => customAjv.validate(schema, val));
  } else if (schema.enum?.includes('no_answer') && value === undefined) {
    return true;
  }

  return customAjv.validate(schema, value);
};

const evaluateCondition = (
  data: Record<string, any>,
  condition: SchemaBasedCondition
): boolean => {
  const value = resolveData(data, getConditionScope(condition));
  return validateSchemaCondition(value, condition.schema);
};
