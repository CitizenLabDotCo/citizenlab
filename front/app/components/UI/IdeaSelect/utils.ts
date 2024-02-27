import { Option } from './typings';
import { IIdeaData } from 'api/ideas/types';

export const optionIsIdea = (option: Option): option is IIdeaData => {
  return 'id' in option;
};

export const getOptionId = (option: Option) =>
  optionIsIdea(option) ? option.id : option.value;
