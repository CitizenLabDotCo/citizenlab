import { IFlatCustomField } from 'api/custom_fields/types';

import { Localize } from 'hooks/useLocalize';

import { MessageDescriptor } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';

import messages from './messages';

export type Pages = {
  page: IFlatCustomField;
  pageQuestions: IFlatCustomField[];
}[];

export const convertCustomFieldsToNestedPages = (
  customFields: IFlatCustomField[]
) => {
  const nestedPagesData: Pages = [];

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

const isNillish = (value: any) => {
  if (!value) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (value.constructor === Object) {
    if (Object.keys(value).length === 0) return true;
    if (isEmptyMultiloc(value)) return true;
  }
  return false;
};

type GetFormCompletionPercentageParams = {
  pageQuestions: IFlatCustomField[];
  currentPageIndex: number;
  lastPageIndex: number;
  formValues: Record<string, any>;
  userIsEditing: boolean;
};

export function getFormCompletionPercentage({
  pageQuestions,
  currentPageIndex, // actually page index
  lastPageIndex, // actually page index
  formValues,
  userIsEditing,
}: GetFormCompletionPercentageParams) {
  const userIsOnLastPage = currentPageIndex === lastPageIndex;

  if (userIsOnLastPage || userIsEditing) {
    return 100;
  }

  // The lastPageNumber is lastPageIndex + 1
  // But the lastPageNumberWithQuestions is lastPageNumber - 1
  const lastPageNumberWithQuestions = lastPageIndex;

  // We will calculate the completion percentage based on:
  // 1. the page number the user is on
  // 2. the number of questions answered on the current page
  const percentagePerPage = 100 / lastPageNumberWithQuestions;

  // 1. Calculate the percentage based on the page number
  const pageNumberPercentage = percentagePerPage * currentPageIndex;

  // 2. Add a percentage based on the number of questions answered on the current page
  const numberOfQuestionsOnPage = pageQuestions.length;
  let indexOfLastFilledOutQuestion = -1;

  pageQuestions.forEach((field, index) => {
    if (!isNillish(formValues[field.key])) {
      indexOfLastFilledOutQuestion = index;
    }
  });

  const percentageOnPage =
    ((indexOfLastFilledOutQuestion + 1) / numberOfQuestionsOnPage) *
    percentagePerPage;

  const percentage = pageNumberPercentage + percentageOnPage;

  return Math.floor(percentage);
}

export const extractOptions = (
  question: IFlatCustomField,
  localize: Localize,
  randomize = false
) => {
  if (!question.options) return [];

  let result = question.options.map((selectOption) => {
    return {
      value: selectOption.key,
      label: localize(selectOption.title_multiloc),
      image: selectOption.image,
    };
  });

  if (randomize) {
    // Separate "other" options from regular options
    const otherOptions = result.filter((option) => option.value === 'other');
    const regularOptions = result.filter((option) => option.value !== 'other');

    // Shuffle only regular options
    for (let i = regularOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [regularOptions[i], regularOptions[j]] = [
        regularOptions[j],
        regularOptions[i],
      ];
    }

    // Recombine arrays
    result = [...regularOptions, ...otherOptions];
  }

  return result;
};

type GetInstructionMessageProps = {
  minItems: number | undefined;
  maxItems: number | undefined;
  optionsLength: number;
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: FormatMessageValues
  ) => string;
};

export const getInstructionMessage = ({
  minItems,
  maxItems,
  formatMessage,
  optionsLength,
}: GetInstructionMessageProps) => {
  if (!isNilOrError(minItems) && !isNilOrError(maxItems)) {
    if (minItems < 1 && maxItems === optionsLength) {
      return formatMessage(messages.selectAsManyAsYouLike);
    }
    if (maxItems === minItems) {
      return formatMessage(messages.selectExactly, {
        selectExactly: maxItems,
      });
    }
    if (minItems !== maxItems) {
      return formatMessage(messages.selectBetween, {
        minItems,
        maxItems,
      });
    }
  }
  return null;
};

const PREFIX = 'u_';

export const addPrefix = (customFieldValues: Record<string, any>) => {
  const newValues = {};

  for (const key in customFieldValues) {
    newValues[`${PREFIX}${key}`] = customFieldValues[key];
  }

  return newValues;
};
