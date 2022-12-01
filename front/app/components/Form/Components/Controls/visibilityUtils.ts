import Ajv from 'ajv';
import {
  UISchemaElement,
  Rule,
  Condition,
  RuleEffect,
  OrCondition,
  AndCondition,
  LeafCondition,
  SchemaBasedCondition,
  Scopable,
  composeWithUi,
} from '@jsonforms/core';
import { isEmpty, has } from 'lodash-es';

export type ExtendedUISchema = {
  ruleArray?: Rule[];
} & UISchemaElement;

const isOrCondition = (condition: Condition): condition is OrCondition =>
  condition.type === 'OR';

const isAndCondition = (condition: Condition): condition is AndCondition =>
  condition.type === 'AND';

const isLeafCondition = (condition: Condition): condition is LeafCondition =>
  condition.type === 'LEAF';

const isSchemaCondition = (
  condition: Condition
): condition is SchemaBasedCondition => has(condition, 'schema');

const getConditionScope = (condition: Scopable, path: string): string => {
  return composeWithUi(condition, path);
};

export const resolveData = (instance: any, dataPath: string): any => {
  if (isEmpty(dataPath)) {
    return instance;
  }
  const dataPathSegments = dataPath.split('.');

  return dataPathSegments
    .map((segment) => decodeURIComponent(segment))
    .reduce((curInstance, decodedSegment) => {
      if (
        !curInstance ||
        !Object.prototype.hasOwnProperty.call(curInstance, decodedSegment)
      ) {
        return undefined;
      }

      return curInstance[decodedSegment];
    }, instance);
};

const evaluateCondition = (
  data: any,
  condition: Condition,
  path: string,
  ajv: Ajv
): boolean => {
  if (isAndCondition(condition)) {
    return condition.conditions.reduce(
      (acc, cur) => acc && evaluateCondition(data, cur, path, ajv),
      true
    );
  } else if (isOrCondition(condition)) {
    return condition.conditions.reduce(
      (acc, cur) => acc || evaluateCondition(data, cur, path, ajv),
      false
    );
  } else if (isLeafCondition(condition)) {
    const value = resolveData(data, getConditionScope(condition, path));
    return value === condition.expectedValue;
  } else if (isSchemaCondition(condition)) {
    const value = resolveData(data, getConditionScope(condition, path));
    return ajv.validate(condition.schema, value) as boolean;
  } else {
    // unknown condition
    return true;
  }
};

const isRuleFulfilled = (
  condition: Condition,
  data: any,
  path: string,
  ajv: Ajv
): boolean => {
  return evaluateCondition(data, condition, path, ajv);
};

export const evalVisibility = (
  uischema: ExtendedUISchema,
  data: any,
  path: string,
  ajv: Ajv
): boolean => {
  if (
    !uischema.ruleArray ||
    (uischema.ruleArray && uischema.ruleArray.length === 0)
  ) {
    return true;
  }

  const fulfilledRule = uischema.ruleArray.find((currentRule) => {
    const fulfilled = isRuleFulfilled(currentRule.condition, data, path, ajv);

    if (currentRule.effect === RuleEffect.HIDE) {
      return !fulfilled;
    } else if (currentRule.effect === RuleEffect.SHOW) {
      return fulfilled;
    }
    return false;
  });

  return !!fulfilledRule;
};

export const isVisible = (
  uischema: ExtendedUISchema,
  data: any,
  path: string,
  ajv: Ajv
): boolean => {
  if (uischema.ruleArray) {
    return evalVisibility(uischema, data, path, ajv);
  }

  return true;
};
