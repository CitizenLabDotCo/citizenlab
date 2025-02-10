import { Layout, JsonSchema7 } from '@jsonforms/core';

import { PageCategorization, PageType } from '../typings';

import customAjv from './customAjv';
import getKey from './getKey';
import getVisiblePages from './getVisiblePages';

const isValidData = (
  schema: JsonSchema7,
  uiSchema: Layout | PageCategorization,
  data: Record<string, any>,
  isSurvey = false
) => {
  if (isSurvey) {
    // If we are dealing with a survey, we need to do some stuff:
    // 1. We only want to take into account the visible pages
    // 2. If the survey is a draft, we only want to take into account the pages up to and including the latest completed page
    //
    // First, we will generate the visible pages
    const visiblePages = getVisiblePages(uiSchema.elements as PageType[], data);

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
  } else {
    return customAjv.validate(schema, data);
  }
};

export default isValidData;

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
