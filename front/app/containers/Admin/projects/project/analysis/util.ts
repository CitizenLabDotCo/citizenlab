import { IInputsData } from 'api/analysis_inputs/types';

export const handleArraySearchParam = (
  paramValue: unknown
): string[] | undefined => {
  if (Array.isArray(paramValue)) return paramValue;
  if (typeof paramValue === 'string' && paramValue.length > 0)
    return [paramValue];
  return undefined;
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
