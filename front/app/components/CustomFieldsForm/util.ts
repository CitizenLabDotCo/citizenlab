import { IOption } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Localize } from 'hooks/useLocalize';

export const convertCustomFieldsToNestedPages = (
  customFields: IFlatCustomField[]
) => {
  const nestedPagesData: {
    page: IFlatCustomField;
    pageQuestions: IFlatCustomField[];
  }[] = [];

  customFields.forEach((field) => {
    if (field.input_type === 'page') {
      nestedPagesData.push({
        page: field,
        pageQuestions: [],
      });
    } else {
      const lastPagesElement = nestedPagesData[nestedPagesData.length - 1];
      lastPagesElement.pageQuestions.push({
        ...field,
      });
    }
  });

  return nestedPagesData;
};

export function getFormCompletionPercentage(
  customFields: IFlatCustomField[],
  formValues: Record<string, any> = {}
) {
  // Count total required fields and answered required fields
  let totalFields = 0;
  let answeredFields = 0;

  customFields.forEach((field) => {
    totalFields += 1;
    if (formValues[field.key]) {
      answeredFields += 1;
    }
  });

  // If no required fields, consider it 100% complete
  if (totalFields === 0) {
    return 100;
  }

  // Calculate and return percentage
  return Math.round((answeredFields / totalFields) * 100);
}

export const extractOptions = (
  question: IFlatCustomField,
  localize: Localize,
  randomize = false
): IOption[] => {
  let result: IOption[] = [];
  if (question.options) {
    result = question.options.map((selectOption) => {
      return {
        value: selectOption.key,
        label: localize(selectOption.title_multiloc),
      } as IOption;
    });

    if (randomize) {
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
  }
  return result;
};
