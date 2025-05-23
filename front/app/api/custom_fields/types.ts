import { IRelationship, Multiloc } from 'typings';

import { IMapConfig } from 'api/map_config/types';

import { Keys } from 'utils/cl-react-query/types';

import customFieldsKeys from './keys';

export type CustomFieldsKeys = Keys<typeof customFieldsKeys>;

export interface ICustomFieldsParameters {
  projectId: string;
  phaseId?: string;
  inputTypes?: ICustomFieldInputType[];
  copy?: boolean;
}

export type ICustomFieldInputType =
  | 'text'
  | 'text_multiloc'
  | 'multiline_text'
  | 'multiselect'
  | 'number'
  | 'select'
  | 'linear_scale'
  | 'ranking'
  | 'rating'
  | 'matrix_linear_scale'
  | 'page'
  | 'file_upload'
  | 'shapefile_upload'
  | 'title_multiloc'
  | 'html_multiloc'
  | 'files'
  | 'image_files'
  | 'topic_ids'
  | 'multiselect_image'
  | 'point'
  | 'line'
  | 'polygon'
  | 'cosponsor_ids'
  | 'sentiment_linear_scale';

export type IOptionsType = {
  id?: string;
  key?: string;
  title_multiloc: Multiloc;
  other?: boolean;
  temp_id?: string;
  image_id?: string;
};

export type IMatrixStatementsType = {
  id: string;
  key: string;
  title_multiloc: Multiloc;
};

export type QuestionRuleType = { if: string | number; goto_page_id: string };

export type LogicType = {
  rules?: QuestionRuleType[];
  next_page_id?: string;
};

export interface IAttributes {
  temp_id?: string;
  logic: LogicType;
  key: string;
  code?: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  input_type: ICustomFieldInputType;
  map_config_id?: string | null;
  page_layout?: 'default' | 'map' | null;
  page_button_label_multiloc?: Multiloc;
  page_button_link?: string;
  required: boolean;
  isRequiredEditable?: boolean;
  isEnabledEditable?: boolean;
  isTitleEditable?: boolean;
  isDeleteEnabled?: boolean;
  ask_follow_up?: boolean;
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
  linear_scale_label_1_multiloc?: Multiloc;
  linear_scale_label_2_multiloc?: Multiloc;
  linear_scale_label_3_multiloc?: Multiloc;
  linear_scale_label_4_multiloc?: Multiloc;
  linear_scale_label_5_multiloc?: Multiloc;
  linear_scale_label_6_multiloc?: Multiloc;
  linear_scale_label_7_multiloc?: Multiloc;
  linear_scale_label_8_multiloc?: Multiloc;
  linear_scale_label_9_multiloc?: Multiloc;
  linear_scale_label_10_multiloc?: Multiloc;
  linear_scale_label_11_multiloc?: Multiloc;
  maximum?: number;
  minimum_select_count?: number;
  maximum_select_count?: number;
  select_count_enabled?: boolean;
  other?: boolean;
  random_option_ordering?: boolean;
  dropdown_layout?: boolean;
  question_category?: string;
  include_in_printed_form?: boolean;
}

export interface ICustomFieldResponse {
  id: string;
  type: string;
  attributes: IAttributes;
  relationships: {
    options: {
      data: IRelationship[];
    };
    matrix_statements?: {
      data: IRelationship[];
    };
    map_config?: {
      data: IRelationship;
    };
    resource?: {
      data: IRelationship;
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
    mapConfig?: IMapConfig;
    options?: IOptionsType[];
    matrix_statements?: IMatrixStatementsType[];
    map_config?: { data: IRelationship };
    visible_to_public?: boolean;
  };

export type ICustomFieldSettingsTab = 'content' | 'logic';

export type IFlatCustomFieldWithIndex = IFlatCustomField & {
  index: number;
  defaultTab?: ICustomFieldSettingsTab;
};

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type ICreateMatrixStatementsType = {
  id?: string;
  title_multiloc: Multiloc;
  temp_id?: string;
};

export type IFlatCreateCustomField = Omit<
  Optional<
    IFlatCustomField,
    | 'description_multiloc'
    | 'type'
    | 'key'
    | 'options'
    | 'ordering'
    | 'created_at'
    | 'updated_at'
    | 'linear_scale_label_1_multiloc'
    | 'linear_scale_label_2_multiloc'
    | 'linear_scale_label_3_multiloc'
    | 'linear_scale_label_4_multiloc'
    | 'linear_scale_label_5_multiloc'
    | 'linear_scale_label_6_multiloc'
    | 'linear_scale_label_7_multiloc'
    | 'linear_scale_label_8_multiloc'
    | 'linear_scale_label_9_multiloc'
    | 'linear_scale_label_10_multiloc'
    | 'linear_scale_label_11_multiloc'
    | 'maximum'
    | 'random_option_ordering'
    | 'dropdown_layout'
    | 'question_category'
    | 'ask_follow_up'
    | 'include_in_printed_form'
  >,
  'matrix_statements'
> & {
  isLocalOnly: boolean;
  matrix_statements?: ICreateMatrixStatementsType[];
};

export interface ICustomFields {
  data: ICustomFieldResponse[];
}

export interface ICustomField {
  data: ICustomFieldResponse;
}
