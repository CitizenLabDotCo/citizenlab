import { JsonSchema7 } from '@jsonforms/core';

import { PageCategorization, PageType } from '../typings';

import customAjv from './customAjv';
import getKey from './getKey';
import getVisiblePages from './getVisiblePages';

const validateSurveyData = (
  schema: JsonSchema7,
  uiSchema: PageCategorization,
  data: Record<string, any>
) => {
  // 1. We only want to take into account the visible pages
  // 2. If the survey is a draft, we only want to take into account the pages up to and including the latest completed page
  //
  // First, we will generate the visible pages.
  // We will assume to be on the last page, since this only
  // get called when submitting the form
  const pages = uiSchema.elements;
  const visiblePages = getVisiblePages(pages, data, pages.length - 1);

  // Second, we will remove the visible pages after the latest completed page
  const visiblePagesUntilLatestCompletePage =
    data.publication_status === 'draft'
      ? visiblePages.slice(0, data.latest_complete_page + 1)
      : visiblePages;

  const newSchema = removeQuestionsFromSchema(
    schema,
    visiblePagesUntilLatestCompletePage
  );

  const newData = removeQuestionsFromData(
    visiblePagesUntilLatestCompletePage,
    data
  );

  return customAjv.validate(newSchema, newData);
};

export default validateSurveyData;

const removeQuestionsFromSchema = (
  schema: JsonSchema7,
  visiblePagesUntilLatestCompletePage: PageType[]
) => {
  const visibleQuestions = visiblePagesUntilLatestCompletePage.reduce(
    (acc, page) => {
      const questionKeys = page.elements.map((el) => getKey(el.scope));

      return [...acc, ...questionKeys];
    },
    []
  );

  const visibleQuestionsSet = new Set(visibleQuestions);

  const required = schema.required ?? [];

  return {
    ...schema,
    required: required.filter((key) => visibleQuestionsSet.has(key)),
  };
};

const removeQuestionsFromData = (
  visiblePagesUntilLatestCompletePage: PageType[],
  data: Record<string, any>
) => {
  const newData = {};

  visiblePagesUntilLatestCompletePage.forEach((page) => {
    page.elements.forEach((element) => {
      const key = getKey(element.scope);
      newData[key] = data[key];
    });
  });

  return newData;
};
