import { JsonSchema7 } from '@jsonforms/core';

import { PageType } from '../typings';

import customAjv from './customAjv';
import getKey from './getKey';

const validateSurveyData = (
  schema: JsonSchema7,
  userPagePath: PageType[],
  data: Record<string, any>
) => {
  const newSchema = removeUnseenQuestionsFromSchema(schema, userPagePath);

  const newData = removeUnseenQuestionsFromData(userPagePath, data);

  return customAjv.validate(newSchema, newData);
};

export default validateSurveyData;

const removeUnseenQuestionsFromSchema = (
  schema: JsonSchema7,
  userPagePath: PageType[]
) => {
  const seenQuestions = userPagePath.reduce((acc, page) => {
    const questionKeys = page.elements.map((el) => getKey(el.scope));

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
  data: Record<string, any>
) => {
  const newData = {};

  userPagePath.forEach((page) => {
    page.elements.forEach((element) => {
      const key = getKey(element.scope);
      newData[key] = data[key];
    });
  });

  return newData;
};
