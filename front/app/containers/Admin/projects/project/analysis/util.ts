import { IInputsData } from 'api/analysis_inputs/types';

export const handleArraySearchParam = (
  paramValue: string | undefined
): string[] | undefined => {
  return paramValue ? JSON.parse(paramValue) : undefined;
};

export const getRelatedTextAnswer = (
  input: IInputsData,
  customFieldKey: string
) => {
  return (
    input.attributes.custom_field_values[`${customFieldKey}_follow_up`] ||
    input.attributes.custom_field_values[`${customFieldKey}_other`]
  );
};

export const isStringArray = (value: any): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
};
