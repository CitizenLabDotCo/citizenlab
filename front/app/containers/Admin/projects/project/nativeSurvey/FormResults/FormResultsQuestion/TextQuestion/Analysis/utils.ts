import { IInputsFilterParams } from 'api/analysis_inputs/types';

// Convert all values in the filters object to strings
// This is necessary because the filters are passed as query params
export const convertFilterValuesToString = (filters?: IInputsFilterParams) => {
  return (
    filters &&
    Object.entries(filters).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: JSON.stringify(value),
      };
    }, {})
  );
};
