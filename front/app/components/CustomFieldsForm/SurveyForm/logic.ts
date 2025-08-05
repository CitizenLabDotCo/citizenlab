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
