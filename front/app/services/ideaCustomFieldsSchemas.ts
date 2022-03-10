import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export type CustomFieldCodes =
  | 'title'
  | 'body'
  | 'topic_ids'
  | 'location'
  | 'images'
  | 'attachments'
  | 'proposed_budget';

export interface JSONSchemaObject {
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

export interface UISchemaObject {
  'ui:widget'?: string;
}

export interface IIdeaFormSchemas {
  json_schema_multiloc: {
    [locale: string]: {
      type: 'object';
      additionalProperties: boolean;
      properties: {
        title: JSONSchemaObject;
        body: JSONSchemaObject;
        topic_ids: JSONSchemaObject;
        proposed_budget: JSONSchemaObject;
        location: JSONSchemaObject;
        images: JSONSchemaObject;
        attachments: JSONSchemaObject;
      };
      required: string[];
    };
  };
  ui_schema_multiloc: {
    [locale: string]: {
      title: UISchemaObject;
      body: UISchemaObject;
      topic_ids: UISchemaObject;
      proposed_budget: UISchemaObject;
      location: UISchemaObject;
      images: UISchemaObject;
      attachments: UISchemaObject;
      'ui:order': string[];
    };
  };
}

export function ideaFormSchemaStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/custom_fields/schema`;
  return streams.get<IIdeaFormSchemas>({
    apiEndpoint,
    ...streamParams,
  });
}
