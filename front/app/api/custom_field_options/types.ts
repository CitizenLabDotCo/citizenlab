import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import customFieldOptionsKeys from './keys';

export type CustomFieldOptionsKeys = Keys<
  typeof customFieldOptionsKeys
>;

export interface ICustomFieldOptionData {
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

export interface ICustomFieldOptions {
  data: ICustomFieldOptionData[];
}

export interface ICustomFieldOption {
  data: ICustomFieldOptionData;
}
