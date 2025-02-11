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

import { HidePageCondition, PageType } from 'components/Form/typings';
import customAjv from 'components/Form/utils/customAjv';
import getOtherControlKey from 'components/Form/utils/getOtherControlKey';

import getKey from './getKey';

const getVisiblePages = (
  pages: PageType[],
  data: Record<string, any>,
  userPagePath: PageType[],
  currentPage: PageType
) => {
  const userPagePathIncludingCurrentPage = [...userPagePath, currentPage];
  const questionsSeenSet = generateQuestionsSeenSet(
    userPagePathIncludingCurrentPage
  );

  // We already know that the current page path + the current page
  // are visible, so we don't need to calculate those.
  const otherVisiblePages = pages
    .filter((page) => !userPagePathIncludingCurrentPage.includes(page))
    .filter((page) => {
      return isVisible(page, data, pages, questionsSeenSet);
    });

  return [...userPagePathIncludingCurrentPage, ...otherVisiblePages];
};

export default getVisiblePages;

const generateQuestionsSeenSet = (
  userPagePathIncludingCurrentPage: PageType[]
) => {
  const questionsSeenSet = new Set<string>();

  userPagePathIncludingCurrentPage.forEach((page) => {
    page.elements.forEach((element) => {
      const key = getKey(element.scope);
      questionsSeenSet.add(key);
    });
  });

  return questionsSeenSet;
};

const isVisible = (
  page: PageType,
  data: Record<string, any>,
  pages: PageType[],
  questionsSeenSet: Set<string>
): boolean => {
  if (page.ruleArray) {
    return evalVisibility(page, data, pages, questionsSeenSet);
  }

  const otherControlKey = getOtherControlKey(page.scope);

  return otherControlKey ? data[otherControlKey] === 'other' : true;
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

  return page.ruleArray.every((currentRule) => {
    // If the rule is a page condition:
    if (isPageCondition(currentRule.condition)) {
      // We find the page that causes the current condition
      // E.g. if this page is page 3, and page 2 says "Go to page 4",
      // then page 2 causes the hide condition on page 3
      const pageThatCausedCondition = pages.find(
        (page) => page.options.id === currentRule.condition.pageId
      );

      if (!pageThatCausedCondition) throw new Error('Page not found'); // should not be possible

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
  data: Record<string, any>,
  condition: SchemaBasedCondition,
  questionsSeenSet: Set<string>
): boolean => {
  const conditionKey = getKey(condition.scope);
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

  if (
    schema.enum?.includes('no_answer') &&
    value === undefined &&
    questionSeen
  ) {
    return true;
  }

  return customAjv.validate(schema, value);
};
