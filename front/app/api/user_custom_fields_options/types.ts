import { Keys } from 'utils/cl-react-query/types';
import userCustomFieldsOptionsKeys from './keys';
import { Multiloc } from 'typings';

export type UserCustomFieldsOptionsKeys = Keys<
  typeof userCustomFieldsOptionsKeys
>;

export interface IUserCustomFieldOptionData {
  id: string;
  type: 'custom_field_option';
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    ordering: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IUserCustomFieldOptions {
  data: IUserCustomFieldOptionData[];
}

export interface IUserCustomFieldOption {
  data: IUserCustomFieldOptionData;
}
