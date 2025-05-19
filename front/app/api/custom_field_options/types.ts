import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import customFieldOptionsKeys from './keys';

export type CustomFieldOptionsKeys = Keys<typeof customFieldOptionsKeys>;

export interface ICustomFieldOptionData {
  id: string;
  type: 'custom_field_option';
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    ordering: number;
    other: boolean;
    temp_id?: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    image: { data?: IRelationship };
  };
}

export interface ICustomFieldOptions {
  data: ICustomFieldOptionData[];
}

export interface ICustomFieldOption {
  data: ICustomFieldOptionData;
}
