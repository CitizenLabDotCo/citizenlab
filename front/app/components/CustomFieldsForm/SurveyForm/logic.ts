import { IFlatCustomField } from 'api/custom_fields/types';

import { Pages } from '../util';

const findPageIndex = (pages: Pages, pageId: string | number) => {
  return pages.findIndex((page) => page.page.id === pageId);
};

const findPageById = (pages: Pages, pageId: string | number) => {
  return pages.find((page) => page.page.id === pageId);
};

const isRuleConditionMet = (
  question: IFlatCustomField,
  rule: {
    if: string | number;
    goto_page_id?: string | number;
  },
  formData?: Record<string, any>
) => {
  const value = formData?.[question.key];

  const optionsWithoutExistingRules = question.options?.filter(
    (option) => !question.logic.rules?.some((r) => r.if === option.id)
  );

  if (rule.if === 'no_answer') {
    return !value || (Array.isArray(value) && value.length === 0);
  }

  switch (question.input_type) {
    case 'select': {
      const optionId = question.options?.find(
        (option) => option.key === value
      )?.id;

      if (rule.if === 'any_other_answer') {
        return (
          optionId !== undefined &&
          optionsWithoutExistingRules?.some((option) => value === option.id)
        );
      }

      return rule.if === optionId || rule.if === String(optionId);
    }

    case 'multiselect':
    case 'multiselect_image': {
      if (rule.if === 'any_other_answer') {
        return (
          value?.length > 0 &&
          optionsWithoutExistingRules?.some((option) =>
            value.includes(option.id)
          )
        );
      }

      // For multiselect, check if any selected options match the rule
      const optionIds = question.options
        ?.filter((option) => value?.includes(option.key))
        .map((option) => option.id);

      return (
        optionIds !== undefined &&
        (optionIds.includes(String(rule.if)) || rule.if === String(optionIds))
      );
    }

    case 'linear_scale':
    case 'rating': {
      const valuesArray = Array.from(Array(question.maximum).keys()).map(
        (i) => i + 1
      );

      const valuesWithoutExistingRules = valuesArray.filter(
        (value) => !question.logic.rules?.some((r) => r.if === value)
      );

      if (rule.if === 'any_other_answer') {
        return (
          value !== undefined &&
          value !== null &&
          valuesWithoutExistingRules.some((option) => option === value)
        );
      }

      return rule.if === value || rule.if === String(value);
    }

    default:
      return rule.if === value || rule.if === String(value);
  }
};

export const determineNextPageNumber = ({
  pages,
  currentPage,
  formData,
}: {
  pages: Pages;
  currentPage: IFlatCustomField;
  formData?: Record<string, any>;
}) => {
  const currentPageIndex = findPageIndex(pages, currentPage.id);
  let nextPageIndex = currentPageIndex + 1;

  const currentPageQuestions = findPageById(
    pages,
    currentPage.id
  )?.pageQuestions;
  const currentPageQuestionsWithLogic = currentPageQuestions?.filter(
    (question) => question.logic.rules?.length
  );

  if (currentPageQuestionsWithLogic?.length) {
    currentPageQuestionsWithLogic.forEach((question) => {
      const rules = question.logic.rules;
      if (rules && rules.length > 0) {
        const metRules = rules.filter((rule) =>
          isRuleConditionMet(question, rule, formData)
        );
        if (metRules.length > 0) {
          // Find the rule that points to the farthest page
          let farthestRule = metRules[0];
          let farthestPageIndex = -1;

          metRules.forEach((rule) => {
            if (rule.goto_page_id) {
              const pageIndex = findPageIndex(pages, rule.goto_page_id);
              if (pageIndex > farthestPageIndex) {
                farthestPageIndex = pageIndex;
                farthestRule = rule;
              }
            }
          });

          const rule = farthestRule;
          nextPageIndex = findPageIndex(pages, rule.goto_page_id);
        }
      }
    });
  } else if (currentPage.logic.next_page_id) {
    nextPageIndex = findPageIndex(pages, currentPage.logic.next_page_id);
  }

  return nextPageIndex;
};

export const determinePreviousPageNumber = ({
  userNavigationHistory,
  currentPageIndex,
}: {
  userNavigationHistory: number[];
  currentPageIndex: number;
}) => {
  // Rely solely on navigation history
  if (userNavigationHistory.length > 1) {
    // Find the current page in the history
    const currentHistoryIndex =
      userNavigationHistory.lastIndexOf(currentPageIndex);

    // If we found the current page and there's a previous page in history
    if (currentHistoryIndex > 0) {
      return userNavigationHistory[currentHistoryIndex - 1];
    }
  }

  // If no history is available, return the sequential previous page
  return Math.max(0, currentPageIndex - 1);
};

/**
 * Traces the complete valid path through the survey based on current form data
 * following all conditional logic rules from the beginning
 */
export const getValidPagePath = ({
  pages,
  formData,
}: {
  pages: Pages;
  formData?: Record<string, any>;
}): number[] => {
  if (pages.length === 0) return [];

  const validPath: number[] = [0];
  let currentPageIndex = 0;
  const maxIterations = pages.length * 2; // Prevent infinite loops
  let iterations = 0;

  // Follow logic from start to end based on current form data
  while (currentPageIndex < pages.length - 1 && iterations < maxIterations) {
    iterations++;

    const nextPageIndex = determineNextPageNumber({
      pages,
      currentPage: pages[currentPageIndex].page,
      formData,
    });

    // If next page is invalid or we're going backwards (loop), stop
    if (
      nextPageIndex < 0 ||
      nextPageIndex >= pages.length ||
      nextPageIndex <= currentPageIndex
    ) {
      break;
    }

    validPath.push(nextPageIndex);
    currentPageIndex = nextPageIndex;
  }

  return validPath;
};

/**
 * Returns all page indices that are NOT in the current valid path.
 * These are pages that have been skipped due to conditional logic.
 */
export const getSkippedPageIndices = ({
  pages,
  formData,
}: {
  pages: Pages;
  formData?: Record<string, any>;
}): number[] => {
  const validPath = getValidPagePath({ pages, formData });
  const validPathSet = new Set(validPath);

  return pages
    .map((_, index) => index)
    .filter((index) => !validPathSet.has(index));
};
