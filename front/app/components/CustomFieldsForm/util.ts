import { IOption } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Localize } from 'hooks/useLocalize';

import { MessageDescriptor } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';

import messages from './messages';

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
  customFields: IFlatCustomField[];
  formValues: Record<string, any>;
  userIsOnLastPage: boolean;
  userIsEditing: boolean;
};

export function getFormCompletionPercentage({
  customFields,
  formValues,
  userIsOnLastPage,
  userIsEditing,
}: GetFormCompletionPercentageParams) {
  if (userIsOnLastPage || userIsEditing) {
    return 100;
  }

  let indexOfLastFilledOutQuestion = -1;

  customFields.forEach((field, index) => {
    if (!isNillish(formValues[field.key])) {
      indexOfLastFilledOutQuestion = index;
    }
  });

  return Math.round(
    // We add 1 to the index, otherwise it doesn't look like it
    // was filled out.
    // e.g. if you have two questions, and you filled out the first one,
    // the index will be 0. If you were to divide that by the length,
    // you would get 0 percent. So instead we add 1- this way, the
    // result is 1 / 2 = 50%.
    ((indexOfLastFilledOutQuestion + 1) / customFields.length) * 100
  );
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
      // Separate "other" options from regular options
      const otherOptions = result.filter((option) => option.value === 'other');
      const regularOptions = result.filter(
        (option) => option.value !== 'other'
      );

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
