import { SupportedLocale } from 'typings';

import { IFlatCustomField, IOptionsType } from 'api/custom_fields/types';

import { formEndOption } from 'components/FormBuilder/utils';

import { isNilOrError } from 'utils/helperUtils';

export const getOptionRule = (
  option: IOptionsType,
  field: IFlatCustomField
) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const rules = field.logic?.rules;
  if (!isNilOrError(rules) && (option.id || option.temp_id)) {
    const rule = rules.find(
      (rule) => rule.if === option.id || rule.if === option.temp_id
    );
    if (rule && rule.if && rule.goto_page_id) {
      return rule;
    }
  }
  return undefined;
};

export const getLinearScaleRule = (
  option: { key: number; label: string },
  field: IFlatCustomField
) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const rules = field.logic?.rules;
  if (!isNilOrError(rules) && option.key) {
    const rule = rules.find((rule) => rule.if === option.key);
    if (rule && rule.if && rule.goto_page_id) {
      return rule;
    }
  }
  return undefined;
};

export const getLinearScaleOptions = (maximum: number) => {
  const linearScaleOptionArray = Array.from(
    { length: maximum },
    (_, i) => i + 1
  );
  const answers = linearScaleOptionArray.map((option) => ({
    key: option,
    label: option.toString(),
  }));
  return answers;
};

export const getTitleFromAnswerId = (
  field: IFlatCustomField,
  answerId: string | number | undefined,
  locale: SupportedLocale | undefined | null | Error
) => {
  if (answerId && !isNilOrError(locale)) {
    // If number, this is a linear scale option. Return the value as a string.
    if (typeof answerId === 'number') {
      return answerId.toString();
    }
    // Otherwise this is an option ID, return the related option title
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const option = field?.options?.find(
      (option) => option.id === answerId || option.temp_id === answerId
    );
    return option?.title_multiloc[locale];
  }
  return undefined;
};

export const getTitleFromPageId = (
  pageId: string | number | undefined,
  formEndMessage: string,
  pageMessage: string,
  fieldNumbers: Record<string, number>
) => {
  if (!pageId) return;
  if (pageId === formEndOption) return formEndMessage;

  return `${pageMessage} ${fieldNumbers[pageId]}`;
};
