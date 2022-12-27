/*
 Reference for some of the code in this file: https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/testers/testers.ts
 * 
*/

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
  resolveData,
} from '@jsonforms/core';
import { has } from 'lodash-es';
import { PageType } from '../Layouts/utils';

interface ConditionWithPageId
  extends Condition,
    Scopable,
    SchemaBasedCondition {
  pageId?: string;
}

interface HidePageCondition extends ConditionWithPageId {
  type: 'HIDEPAGE';
}

export type ExtendedRule = {
  /**
   * The effect of the rule
   */
  effect: RuleEffect;
  /**
   * The condition of the rule that must evaluate to true in order
   * to trigger the effect.
   */
  condition: ConditionWithPageId;
} & Rule;

export type ExtendedUISchema = {
  ruleArray?: ExtendedRule[];
  label?: string;
} & UISchemaElement &
  Scopable;

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

const getConditionScope = (condition: Scopable, path: string): string => {
  return composeWithUi(condition, path);
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

const evalVisibility = (
  uischema: ExtendedUISchema | PageType,
  data: any,
  path: string,
  ajv: Ajv,
  pages?: PageType[]
): boolean => {
  if (
    !uischema.ruleArray ||
    (uischema.ruleArray && uischema.ruleArray.length === 0)
  ) {
    return true;
  }

  const fulfilledRule = uischema.ruleArray.every((currentRule) => {
    const pageWithId = (pages || []).find(
      (page) => page.options?.id === currentRule.condition?.pageId
    );
    const hasQuestionRule = pageWithId?.elements.find(
      (element) => element.options?.hasRule
    );

    // Question rule takes precedence over page rule
    if (isHidePageCondition(currentRule.condition) && !hasQuestionRule) {
      return pageWithId
        ? !isVisible(pageWithId, data, path, ajv, pages)
        : false;
    }

    if (isHidePageCondition(currentRule.condition)) {
      return true;
    }

    const fulfilled = isRuleFulfilled(currentRule.condition, data, path, ajv);

    if (currentRule.effect === RuleEffect.HIDE) {
      return !fulfilled;
    } else if (currentRule.effect === RuleEffect.SHOW) {
      return fulfilled;
    }
    return false;
  });

  return fulfilledRule;
};

export const isVisible = (
  uischema: ExtendedUISchema | PageType,
  data: any,
  path: string,
  ajv: Ajv,
  pages?: PageType[]
): boolean => {
  if (uischema.ruleArray) {
    return evalVisibility(uischema, data, path, ajv, pages);
  }

  return true;
};
