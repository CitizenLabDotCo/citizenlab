import { IUserData } from 'api/users/types';

import { Option } from './typings';

export const optionIsUser = (option: Option): option is IUserData => {
  return 'id' in option;
};

export const getOptionId = (option: Option) =>
  optionIsUser(option) ? option.id : option.value;
