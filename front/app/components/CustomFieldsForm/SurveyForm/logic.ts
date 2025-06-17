import { IFlatCustomField } from 'api/custom_fields/types';

import { Pages } from '../util';

// Utility function to check if a rule condition is met
const isRuleConditionMet = (
  question: IFlatCustomField,
  rule: {
    if: string | number;
    goto_page_id?: string | number;
  },
  formData?: Record<string, any>
) => {
  const value = formData?.[question.key];

  if (rule.if === 'no_answer') {
    return !value || (Array.isArray(value) && value.length === 0);
  }

  if (question.input_type === 'select') {
    const optionId = question.options?.find(
      (option) => option.key === value
    )?.id;

    if (rule.if === 'any_other_answer') {
      return (
        optionId !== undefined &&
        rule.if !== optionId &&
        rule.if !== String(optionId)
      );
    }

    return rule.if === optionId || rule.if === String(optionId);
  }

  if (
    question.input_type === 'multiselect' ||
    question.input_type === 'multiselect_image'
  ) {
    if (rule.if === 'any_other_answer') {
      return (
        value?.length > 0 &&
        !question.options?.some((option) => option.key === value[0])
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

  // Default case for other input types
  if (rule.if === 'any_other_answer') {
    return (
      value !== undefined &&
      value !== null &&
      !question.options?.some((option) => option.key === value)
    );
  }

  return rule.if === value || rule.if === String(value);
};

// Utility function to find page index by ID
const findPageIndex = (pages: Pages, pageId: string | number) => {
  return pages.findIndex((page) => page.page.id === pageId);
};

// Utility function to find a page by ID
const findPageById = (pages: Pages, pageId: string | number) => {
  return pages.find((page) => page.page.id === pageId);
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
        const rule = rules.find((rule) =>
          isRuleConditionMet(question, rule, formData)
        );

        if (rule) {
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
  pages,
  currentPage,
  formData,
}: {
  pages: Pages;
  currentPage: IFlatCustomField;
  formData?: Record<string, any>;
}) => {
  const currentPageIndex = findPageIndex(pages, currentPage.id);
  let previousPageIndex = currentPageIndex - 1;

  const questionsWithLogic = pages.map((page) =>
    page.pageQuestions.filter((question) => question.logic.rules?.length)
  );

  const questionsWithLogicReferringToCurrentPage = questionsWithLogic
    .flat()
    .filter((question) =>
      question.logic.rules?.some((rule) => rule.goto_page_id === currentPage.id)
    );

  if (questionsWithLogicReferringToCurrentPage.length > 0) {
    questionsWithLogicReferringToCurrentPage.forEach((question) => {
      const rules = question.logic.rules;
      if (rules && rules.length > 0) {
        const rule = rules.find((rule) =>
          isRuleConditionMet(question, rule, formData)
        );

        if (rule) {
          const previousPage = pages.find((page) =>
            page.pageQuestions.some(
              (pageQuestion) => pageQuestion.id === question.id
            )
          );

          if (previousPage) {
            previousPageIndex = findPageIndex(pages, previousPage.page.id);
          }
        }
      }
    });
  } else {
    const previousPage = pages.find(
      (page) => currentPage.id === page.page.logic.next_page_id
    );
    if (previousPage) {
      previousPageIndex = findPageIndex(pages, previousPage.page.id);
    }
  }

  return previousPageIndex;
};
