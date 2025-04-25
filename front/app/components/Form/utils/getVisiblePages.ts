/*
 Reference for some of the code in this file: https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/testers/testers.ts
 *
*/
import {
  Condition,
  SchemaBasedCondition,
  resolveData,
  JsonSchema,
} from '@jsonforms/core';

import {
  FormValues,
  HidePageCondition,
  PageType,
} from 'components/Form/typings';
import customAjv from 'components/Form/utils/customAjv';

import { getFieldNameFromPath } from 'utils/JSONFormUtils';

const getVisiblePages = (
  pages: PageType[],
  data: FormValues,
  userPagePath: PageType[]
) => {
  const questionsSeenSet = generateQuestionsSeenSet(userPagePath);

  // We already know that the current page path + the current page
  // are visible, so we don't need to calculate those.
  const otherVisiblePages = pages
    .filter((page) => !userPagePath.includes(page))
    .filter((page) => {
      return isVisible(page, data, pages, questionsSeenSet);
    });

  return [...userPagePath, ...otherVisiblePages];
};

export default getVisiblePages;

const generateQuestionsSeenSet = (userPagePath: PageType[]) => {
  return new Set(
    userPagePath.flatMap((page) =>
      page.elements.map((element) => getFieldNameFromPath(element.scope))
    )
  );
};

const isVisible = (
  page: PageType,
  data: FormValues,
  pages: PageType[],
  questionsSeenSet: Set<string>
): boolean => {
  if (page.ruleArray) {
    return evalVisibility(page, data, pages, questionsSeenSet);
  }

  return true;
};

const evalVisibility = (
  page: PageType,
  data: any,
  pages: PageType[],
  questionsSeenSet: Set<string>
): boolean => {
  if (!page.ruleArray || page.ruleArray.length === 0) {
    return true;
  }

  // Every single rule has to evaluate to "visible"
  // for the page to be visible
  // The conditions, however, are defined as "hide" conditions
  // so in the code below you will see the conditions evaluated
  // and then negated.
  return page.ruleArray.every((currentRule) => {
    // If the rule is a page condition:
    if (isPageCondition(currentRule.condition)) {
      // We find the page that causes the current condition
      // E.g. if this page is page 3, and page 2 says "Go to page 4",
      // then page 2 causes the hide condition on page 3
      const pageThatCausedCondition = pages.find(
        (page) => page.options.id === currentRule.condition.pageId
      );

      // type guard, should not be possible
      if (!pageThatCausedCondition) throw new Error('Page not found');

      // Then we check if any quesiton on that page that causes the
      // condition has a question rule
      const pageThatCausedConditionHasQuestionRule =
        pageThatCausedCondition.elements.find(
          (element) => element.options?.hasRule
        );

      if (pageThatCausedConditionHasQuestionRule) {
        // So, if the page that caused the condition has a question rule,
        // we will ignore this page-visibility condition.
        // Why? Because the backend will generate more conditions
        // covering all the question rules, and we will evaluate those instead.
        // Kind of confusing, and it would be better if the BE didn't include
        // this page rule at all in this case, so we could skip this check.
        return true;
      } else {
        const pageThatCausedConditionIsVisible = isVisible(
          pageThatCausedCondition,
          data,
          pages,
          questionsSeenSet
        );

        // Again a bit counterintuitive, but if we are on page 3,
        // and page 2 points to page 4, then page 2 is the one that causes
        // the hide condition on this page (3). So if page 2 is visible,
        // this page should be hidden.
        return !pageThatCausedConditionIsVisible;
      }
    }

    // If the rule is a question condition:
    const shouldHide = evaluateCondition(
      data,
      currentRule.condition,
      questionsSeenSet
    );

    const visible = !shouldHide;

    return visible;
  });
};

const isPageCondition = (
  condition: Condition
): condition is HidePageCondition => condition.type === 'HIDEPAGE';

const evaluateCondition = (
  data: FormValues,
  condition: SchemaBasedCondition,
  questionsSeenSet: Set<string>
): boolean => {
  const conditionKey = getFieldNameFromPath(condition.scope);
  const value = resolveData(data, conditionKey);

  const questionSeen = questionsSeenSet.has(conditionKey);

  return validateSchemaCondition(value, condition.schema, questionSeen);
};

/**
 * Validates a schema condition.
 * Handles both single values and arrays of values.
 *
 * @param value - The resolved value to validate (single or array).
 * @param schema - The JSON schema to validate against.
 * @param pageSeen - Whether the current page has already been seen by the user.
 * @returns {boolean} - True if the value or any array item matches the schema.
 */
const validateSchemaCondition = (
  value: any,
  schema: JsonSchema,
  questionSeen: boolean
): boolean => {
  if (Array.isArray(value)) {
    // For arrays, check if at least one element passes validation. Important for multi-select and image-select
    return value.some((val) => customAjv.validate(schema, val));
  }

  // A value being undefined can mean two things:
  // 1. The user has not answered/seen the question yet
  // 2. The user has seen the question, but has not answered it
  // We only want to interpret undefined as "no_answer" if the user has seen the question.
  // That's why we add the pageSeen variable.
  if (
    schema.enum?.includes('no_answer') &&
    value === undefined &&
    questionSeen
  ) {
    return true;
  }

  return customAjv.validate(schema, value);
};
