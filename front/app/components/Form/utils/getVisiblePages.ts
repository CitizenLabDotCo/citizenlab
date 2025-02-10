import {
  Condition,
  resolveData,
  JsonSchema,
  SchemaBasedCondition,
  composeWithUi,
  Scopable,
} from '@jsonforms/core';

import { PageType, HidePageCondition } from '../typings';

import customAjv from './customAjv';

const getVisiblePages = (pages: PageType[], data: Record<string, any>) => {
  return pages.filter((page) => evalVisibility(page, data, pages));
};

export default getVisiblePages;

const evalVisibility = (
  page: PageType,
  data: Record<string, any>,
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
      return pageWithId ? !evalVisibility(pageWithId, data, pages) : false;
    }

    if (isHidePageCondition(currentRule.condition)) {
      return true;
    }

    const fulfilled = evaluateCondition(currentRule.condition, data);

    if (currentRule.effect === 'HIDE') {
      return !fulfilled;
    }

    return false;
  });

  return fulfilledRule;
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

const isHidePageCondition = (
  condition: Condition
): condition is HidePageCondition => condition.type === 'HIDEPAGE';

const isSchemaCondition = (
  condition: Condition
): condition is SchemaBasedCondition => 'schema' in condition;

const getConditionScope = (condition: Scopable): string => {
  return composeWithUi(condition, '');
};
