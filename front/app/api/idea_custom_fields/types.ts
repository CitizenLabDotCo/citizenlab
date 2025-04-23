import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import ideaCustomFieldsKeys from './keys';

export type IdeaCustomFieldsKeys = Keys<typeof ideaCustomFieldsKeys>;

export type IIdeaCustomFieldInputType =
  | 'text'
  | 'number'
  | 'multiline_text'
  | 'select'
  | 'multiselect'
  | 'ranking'
  | 'matrix_linear_scale'
  | 'sentiment_linear_scale'
  | 'checkbox'
  | 'date'
  | 'linear_scale'
  | 'rating'
  | 'file_upload'
  | 'shapefile_upload'
  | 'point'
  | 'line'
  | 'polygon'
  | 'multiselect_image';

export type TCustomFieldCode =
  | 'gender'
  | 'birthyear'
  | 'domicile'
  | 'title_multiloc'
  | 'body_multiloc'
  | 'topic_ids'
  | 'cosponsor_ids'
  | 'location_description'
  | 'proposed_budget'
  | 'idea_images_attributes'
  | 'idea_files_attributes'
  | 'author_id'
  | 'budget'
  | 'title_page'
  | 'uploads_page'
  | 'details_page';

export interface IIdeaCustomFieldData {
  id: string;
  type: string;
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    input_type: IIdeaCustomFieldInputType;
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
    matrix_statements: {
      data: IRelationship[];
    };
    current_ref_distribution: {
      data: IRelationship;
    };
  };
}

export interface IIdeaCustomField {
  data: IIdeaCustomFieldData;
}

export interface IIdeaCustomFields {
  data: IIdeaCustomFieldData[];
}

export interface IIdeaCustomFields {
  data: IIdeaCustomFieldData[];
}

export interface IQueryParameters {
  inputTypes?: IIdeaCustomFieldInputType[];
}
