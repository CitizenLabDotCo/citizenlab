import { IFlatCustomField } from 'api/custom_fields/types';

import { Pages } from '../util';

export const determineNextPageNumber = ({
  pages,
  currentPage,
  formData,
}: {
  pages: Pages;
  currentPage: IFlatCustomField;
  formData?: Record<string, any>;
}) => {
  const currentPageIndex = pages.findIndex(
    (page) => page.page.id === currentPage.id
  );
  let nextPageIndex = currentPageIndex + 1;

  const currentPageQuestions = pages.find(
    (page) => page.page.id === currentPage.id
  )?.pageQuestions;

  const currentPageQuestionsWithLogic = currentPageQuestions?.filter(
    (question) => question.logic.rules?.length
  );
  if (currentPageQuestionsWithLogic?.length) {
    currentPageQuestionsWithLogic.forEach((question) => {
      const rules = question.logic.rules;
      if (rules && rules.length > 0) {
        const rule = rules.find((rule) => {
          const value = formData?.[question.key];
          if (question.input_type === 'select') {
            const optionId = question.options?.find(
              (option) => option.key === value
            )?.id;
            if (rule.if === 'any_other_answer') {
              return (
                optionId !== undefined &&
                (rule.if !== optionId || rule.if !== String(optionId))
              );
            } else if (rule.if === 'no_answer') {
              return !value;
            }

            return rule.if === optionId || rule.if === String(optionId);
          } else if (
            question.input_type === 'multiselect' ||
            question.input_type === 'multiselect_image'
          ) {
            const optionIds = question.options
              ?.filter((option) => value?.includes(option.key))
              .map((option) => option.id);
            return (
              optionIds !== undefined &&
              (optionIds.includes(String(rule.if)) ||
                rule.if === String(optionIds))
            );
          } else {
            return rule.if === value || rule.if === String(value);
          }
        });

        if (rule) {
          const nextPage = pages.find(
            (page) => page.page.id === rule.goto_page_id
          ) as Pages[number];
          nextPageIndex = pages.findIndex(
            (page) => page.page.id === nextPage.page.id
          );
        }
      }
    });
  } else if (currentPage.logic.next_page_id) {
    pages.find((page) => page.page.id === currentPage.logic.next_page_id);
    nextPageIndex = pages.findIndex(
      (page) => page.page.id === currentPage.logic.next_page_id
    );
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
  const currentPageIndex = pages.findIndex(
    (page) => page.page.id === currentPage.id
  );
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
        const rule = rules.find((rule) => {
          const value = formData?.[question.key];
          const optionId = question.options?.find(
            (option) => option.key === value
          )?.id;

          if (question.input_type === 'select') {
            if (rule.if === 'any_other_answer') {
              return (
                optionId !== undefined &&
                (rule.if !== optionId || rule.if !== String(optionId))
              );
            } else if (rule.if === 'no_answer') {
              return !value;
            }
            return (
              optionId !== undefined &&
              (rule.if === optionId || rule.if === String(optionId))
            );
          }
          if (
            question.input_type === 'multiselect' ||
            question.input_type === 'multiselect_image'
          ) {
            const optionIds = question.options
              ?.filter((option) => value?.includes(option.key))
              .map((option) => option.id);
            return (
              optionIds !== undefined &&
              (optionIds.includes(String(rule.if)) ||
                rule.if === String(optionIds))
            );
          }
          return rule.if === value || rule.if === String(value);
        });

        if (rule) {
          const previousPage = pages.find((page) =>
            page.pageQuestions.some(
              (pageQuestion) => pageQuestion.id === question.id
            )
          );

          if (previousPage) {
            previousPageIndex = pages.findIndex(
              (page) => page.page.id === previousPage.page.id
            );
          }
        }
      }
    });
  } else {
    const previousPage = pages.find(
      (page) => currentPage.id === page.page.logic.next_page_id
    );
    if (previousPage) {
      previousPageIndex = pages.findIndex(
        (page) => page.page.id === previousPage.page.id
      );
    }
  }
  return previousPageIndex;
};
