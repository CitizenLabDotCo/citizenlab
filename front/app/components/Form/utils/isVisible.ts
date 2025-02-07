/*
 Reference for some of the code in this file: https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/testers/testers.ts
 *
*/
import {
  Condition,
  RuleEffect,
  OrCondition,
  AndCondition,
  LeafCondition,
  SchemaBasedCondition,
  Scopable,
  composeWithUi,
  resolveData,
  JsonSchema,
} from '@jsonforms/core';
import { has } from 'lodash-es';

import {
  HidePageCondition,
  ExtendedUISchema,
  PageType,
} from 'components/Form/typings';
import customAjv from 'components/Form/utils/customAjv';
import getOtherControlKey from 'components/Form/utils/getOtherControlKey';

const isHidePageCondition = (
  condition: Condition
): condition is HidePageCondition => condition.type === 'HIDEPAGE';

const isOrCondition = (condition: Condition): condition is OrCondition =>
  condition.type === 'OR';

const isAndCondition = (condition: Condition): condition is AndCondition =>
  condition.type === 'AND';

const isLeafCondition = (condition: Condition): condition is LeafCondition =>
  condition.type === 'LEAF';

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

const evaluateCondition = (data: any, condition: Condition): boolean => {
  if (isAndCondition(condition)) {
    return condition.conditions.reduce(
      (acc, cur) => acc && evaluateCondition(data, cur),
      true
    );
  } else if (isOrCondition(condition)) {
    return condition.conditions.reduce(
      (acc, cur) => acc || evaluateCondition(data, cur),
      false
    );
  } else if (isLeafCondition(condition)) {
    const value = resolveData(data, getConditionScope(condition));
    return value === condition.expectedValue;
  } else if (isSchemaCondition(condition)) {
    // Schema condition: validates the resolved value(s) against the schema
    const value = resolveData(data, getConditionScope(condition));
    return validateSchemaCondition(value, condition.schema);
  } else {
    // unknown condition
    return true;
  }
};

const isRuleFulfilled = (condition: Condition, data: any): boolean => {
  return evaluateCondition(data, condition);
};

const evalVisibility = (
  uischema: ExtendedUISchema | PageType,
  data: any,
  pages?: PageType[]
): boolean => {
  if (!uischema.ruleArray || uischema.ruleArray.length === 0) {
    return true;
  }

  const fulfilledRule = uischema.ruleArray.every((currentRule) => {
    const pageWithId = (pages || []).find(
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

    const fulfilled = isRuleFulfilled(currentRule.condition, data);

    if (currentRule.effect === RuleEffect.HIDE) {
      return !fulfilled;
    } else if (currentRule.effect === RuleEffect.SHOW) {
      return fulfilled;
    }
    return false;
  });

  return fulfilledRule;
};

const isVisible = (
  uischema: PageType,
  data: any,
  pages?: PageType[]
): boolean => {
  if (uischema.ruleArray) {
    return evalVisibility(uischema, data, pages);
  }

  const otherControlKey = getOtherControlKey(uischema.scope);

  return otherControlKey ? data[otherControlKey] === 'other' : true;
};

export default isVisible;
