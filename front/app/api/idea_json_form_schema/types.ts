import ideaJsonFormSchemaKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';
import { Locale } from 'typings';
import { Layout } from '@jsonforms/core';

export type IdeaJsonFormSchemaKeys = Keys<typeof ideaJsonFormSchemaKeys>;

export type IParameters = {
  projectId?: string | null;
  phaseId?: string | null;
  inputId?: string | null;
};

export type CustomFieldCodes =
  | 'title_multiloc'
  | 'body_multiloc'
  | 'topic_ids'
  | 'location_description'
  | 'idea_images_attributes'
  | 'idea_files_attributes'
  | 'proposed_budget';

export interface JSONSFormsSchemaObject {
  title: string;
  description: string;
  type: 'string' | 'array';
  uniqueItems?: boolean;
  minItems?: number;
  items?: {
    type: 'string' | 'array';
    format?: 'data-url' | 'string';
  };
}

export interface JsonFormsSchema {
  type: 'object';
  additionalProperties: boolean;
  properties: {
    [key in CustomFieldCodes]: JSONSFormsSchemaObject;
  };
  required: string[];
}

export interface IIdeaJsonFormSchemas {
  data: {
    type: 'json_forms_schema';
    attributes: {
      json_schema_multiloc: {
        [key in Locale]?: JsonFormsSchema;
      };
      ui_schema_multiloc: { [key in Locale]?: Layout };
    };
  };
}
