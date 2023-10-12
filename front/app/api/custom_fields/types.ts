import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import customFieldsKeys from './keys';

export type CustomFieldsKeys = Keys<typeof customFieldsKeys>;

export interface ICustomFieldsParameters {
  projectId: string;
  phaseId?: string;
  inputTypes?: ICustomFieldInputType[];
}

export type ICustomFieldInputType =
  | 'text'
  | 'multiline_text'
  | 'multiselect'
  | 'number'
  | 'select'
  | 'linear_scale'
  | 'section'
  | 'page'
  | 'file_upload'
  | 'title_multiloc'
  | 'html_multiloc'
  | 'files'
  | 'image_files'
  | 'topic_ids';

export type IOptionsType = {
  id?: string;
  title_multiloc: Multiloc;
  temp_id?: string;
};

export type QuestionRuleType = { if: string | number; goto_page_id: string };

export type LogicType = {
  rules?: QuestionRuleType[];
  next_page_id?: string;
};

export interface IAttributes {
  temp_id: string;
  logic: LogicType;
  key: string;
  code?: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  input_type: ICustomFieldInputType;
  required: boolean;
  isRequiredEditable?: boolean;
  isEnabledEditable?: boolean;
  isTitleEditable?: boolean;
  isDeleteEnabled?: boolean;
  constraints?: {
    locks: {
      title_multiloc?: boolean;
      enabled?: boolean;
      required?: boolean;
    };
  };
  enabled: boolean;
  ordering: number;
  created_at: string;
  updated_at: string;
  minimum_label_multiloc: Multiloc;
  maximum_label_multiloc: Multiloc;
  maximum: number;
  minimum_select_count?: number;
  maximum_select_count?: number;
  select_count_enabled?: boolean;
}

export interface ICustomFieldResponse {
  id: string;
  type: string;
  attributes: IAttributes;
  relationships: {
    options: {
      data: IRelationship[];
    };
  };
}

// This structure contains all response data from the API, includes more and is flattened to work with the differences in the body of the update structure and that of the get response
export type IFlatCustomField = Omit<
  ICustomFieldResponse,
  'attributes' | 'relationships'
> &
  IAttributes & {
    isLocalOnly?: boolean;
    options?: IOptionsType[];
  };

export type IFlatCustomFieldWithIndex = IFlatCustomField & {
  index: number;
};

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type IFlatCreateCustomField = Optional<
  IFlatCustomField,
  | 'description_multiloc'
  | 'type'
  | 'key'
  | 'options'
  | 'ordering'
  | 'created_at'
  | 'updated_at'
  | 'minimum_label_multiloc'
  | 'maximum_label_multiloc'
  | 'maximum'
> & {
  isLocalOnly: boolean;
};

export interface ICustomFields {
  data: ICustomFieldResponse[];
}

export interface ICustomField {
  data: ICustomFieldResponse;
}
