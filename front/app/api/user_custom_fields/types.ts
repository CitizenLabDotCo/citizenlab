import { Keys } from 'utils/cl-react-query/types';
import userCustomFieldsKeys from './keys';
import { IRelationship, Multiloc } from 'typings';

export type UserCustomFieldsKeys = Keys<typeof userCustomFieldsKeys>;

export type IUserCustomFieldInputType =
  | 'text'
  | 'number'
  | 'multiline_text'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'date';

export type TCustomFieldCode =
  | 'gender'
  | 'birthyear'
  | 'domicile'
  | 'education'
  | 'title'
  | 'body'
  | 'topic_ids'
  | 'location'
  | 'proposed_budget'
  | 'images'
  | 'attachments';

export interface IUserCustomFieldData {
  id: string;
  type: string;
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    input_type: IUserCustomFieldInputType;
    required: boolean;
    code: TCustomFieldCode | null;
    enabled: boolean;
    ordering: number;
    hidden: boolean;
    created_at: string;
    updated_at: string;
  };
  relationships?: {
    custom_field_options: {
      data: IRelationship;
    };
    current_ref_distribution: {
      data: IRelationship;
    };
  };
}

export interface IUserCustomField {
  data: IUserCustomFieldData;
}

export interface IUserCustomFields {
  data: IUserCustomFieldData[];
}

export interface IUserCustomField {
  data: IUserCustomFieldData;
}

export interface IUserCustomFields {
  data: IUserCustomFieldData[];
}

export interface IQueryParameters {
  inputTypes?: IUserCustomFieldInputType[];
}
