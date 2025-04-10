import { JsonSchema } from '@jsonforms/core';

import { getFieldNameFromPath } from 'utils/JSONFormUtils';

import { FormValues, PageType } from '../typings';

import customAjv from './customAjv';

const validateSurveyData = (
  schema: JsonSchema,
  userPagePath: PageType[],
  data: FormValues
) => {
  const newSchema = removeUnseenQuestionsFromSchema(schema, userPagePath);

  const newData = removeUnseenQuestionsFromData(userPagePath, data);

  return customAjv.validate(newSchema, newData);
};

export default validateSurveyData;

const removeUnseenQuestionsFromSchema = (
  schema: JsonSchema,
  userPagePath: PageType[]
) => {
  const seenQuestions = userPagePath.reduce((acc, page) => {
    const questionKeys = page.elements.map((el) =>
      getFieldNameFromPath(el.scope)
    );

    return [...acc, ...questionKeys];
  }, []);

  const seenQuestionsSet = new Set(seenQuestions);

  const required = schema.required ?? [];

  return {
    ...schema,
    required: required.filter((key) => seenQuestionsSet.has(key)),
  };
};

const removeUnseenQuestionsFromData = (
  userPagePath: PageType[],
  data: FormValues
) => {
  const newData = {};

  userPagePath.forEach((page) => {
    page.elements.forEach((element) => {
      const key = getFieldNameFromPath(element.scope);
      newData[key] = data[key];
    });
  });

  return newData;
};
