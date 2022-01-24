import { Layout } from '@jsonforms/core';
import { API_PATH } from 'containers/App/constants';
import { Locale } from 'typings';
import streams, { IStreamParams } from 'utils/streams';

export type CustomFieldCodes =
  | 'title'
  | 'body'
  | 'topic_ids'
  | 'location'
  | 'images'
  | 'attachments'
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

export interface IIdeaJsonFormSchemas {
  json_schema_multiloc: {
    [key in Locale]?: {
      type: 'object';
      additionalProperties: boolean;
      properties: {
        title: JSONSFormsSchemaObject;
        body: JSONSFormsSchemaObject;
        topic_ids: JSONSFormsSchemaObject;
        proposed_budget: JSONSFormsSchemaObject;
        location: JSONSFormsSchemaObject;
        images: JSONSFormsSchemaObject;
        attachments: JSONSFormsSchemaObject;
      };
      required: string[];
    };
  };
  ui_schema_multiloc: { [key in Locale]?: Layout };
}

export function ideaJsonFormsSchemaStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/custom_fields/json_forms_schema`;
  return streams.get<IIdeaJsonFormSchemas>({
    apiEndpoint,
    ...streamParams,
  });
}
