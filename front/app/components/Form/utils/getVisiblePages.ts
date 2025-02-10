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
import { has } from 'lodash-es';

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

  const fulfilledRule = page.ruleArray.every((currentRule) => {
    const pageWithId = pages.find(
      (page) => page.options.id === currentRule.condition.pageId
    );

    const hasQuestionRule = pageWithId?.elements.find(
      (element) => element.options?.hasRule
    );

    // Question rule takes precedence over page rule
    if (isHidePageCondition(currentRule.condition) && !hasQuestionRule) {
      return pageWithId ? !isVisible(pageWithId, data, pages) : false;
    }

    if (isHidePageCondition(currentRule.condition)) {
      return true;
    }

    const fulfilled = evaluateCondition(data, currentRule.condition);

    if (currentRule.effect === 'HIDE') {
      return !fulfilled;
    }

    return false;
  });

  return fulfilledRule;
};

const isHidePageCondition = (
  condition: Condition
): condition is HidePageCondition => condition.type === 'HIDEPAGE';

const isSchemaCondition = (
  condition: Condition
): condition is SchemaBasedCondition => has(condition, 'schema');

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
  condition: Condition
): boolean => {
  if (isSchemaCondition(condition)) {
    // Schema condition: validates the resolved value(s) against the schema
    const value = resolveData(data, getConditionScope(condition));
    return validateSchemaCondition(value, condition.schema);
  } else {
    // unknown condition
    return true;
  }
};
