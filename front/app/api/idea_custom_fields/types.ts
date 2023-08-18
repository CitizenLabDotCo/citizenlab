import { Keys } from 'utils/cl-react-query/types';
import ideaCustomFieldsKeys from './keys';
import { IRelationship, Multiloc } from 'typings';

export type IdeaCustomFieldsKeys = Keys<typeof ideaCustomFieldsKeys>;

export type IIdeaCustomFieldInputType =
  | 'text'
  | 'number'
  | 'multiline_text'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'date'
  | 'linear_scale'
  | 'file_upload';

export type TCustomFieldCode =
  | 'gender'
  | 'birthyear'
  | 'domicile'
  | 'education'
  | 'title_multiloc'
  | 'body_multiloc'
  | 'topic_ids'
  | 'location_description'
  | 'proposed_budget'
  | 'idea_images_attributes'
  | 'idea_files_attributes'
  | 'author_id'
  | 'budget'
  | 'ideation_section1'
  | 'ideation_section2'
  | 'ideation_section3';

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
