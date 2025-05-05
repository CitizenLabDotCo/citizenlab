import { IInputsData } from 'api/analysis_inputs/types';

export const handleArraySearchParam = (
  searchParams: URLSearchParams,
  paramName: string
) => {
  const result: string[] | undefined =
    searchParams.get(paramName) &&
    typeof searchParams.get(paramName) === 'string'
      ? JSON.parse(searchParams.get(paramName) as string)
      : undefined;

  return result;
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
