import { IIdeaData } from 'api/ideas/types';

import { Option } from './typings';

export const optionIsIdea = (option: Option): option is IIdeaData => {
  return 'id' in option;
};

// `readonly`-aware array guard. Unlike the built-in `Array.isArray` (typed
// `arg is any[]`), this narrows `readonly Option[]` out of a union in the
// negative branch, so single-select callers can treat the value as one option.
export const isOptionArray = (
  option: Option | readonly Option[]
): option is readonly Option[] => Array.isArray(option);

export const getOptionId = (option: Option) =>
  optionIsIdea(option) ? option.id : option.value;
