import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export type CustomFieldCodes =
  | 'title_multiloc'
  | 'body_multiloc'
  | 'topic_ids'
  | 'location_description'
  | 'idea_images_attributes'
  | 'idea_files_attributes'
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
        title_multiloc: JSONSchemaObject;
        body_multiloc: JSONSchemaObject;
        topic_ids: JSONSchemaObject;
        proposed_budget: JSONSchemaObject;
        location_description: JSONSchemaObject;
        idea_images_attributes: JSONSchemaObject;
        idea_files_attributes: JSONSchemaObject;
      };
      required: string[];
    };
  };
  ui_schema_multiloc: {
    [locale: string]: {
      title_multiloc: UISchemaObject;
      body_multiloc: UISchemaObject;
      topic_ids: UISchemaObject;
      proposed_budget: UISchemaObject;
      location_description: UISchemaObject;
      idea_images_attributes: UISchemaObject;
      idea_files_attributes: UISchemaObject;
      'ui:order': string[];
    };
  };
}

const getInputFormsSchemaEndpoint = (
  projectId: string,
  phaseId?: string | null,
  inputId?: string
) => {
  if (inputId) {
    return `${API_PATH}/ideas/${inputId}/schema`;
  } else if (phaseId) {
    return `${API_PATH}/phases/${phaseId}/custom_fields/schema`;
  }
  return `${API_PATH}/projects/${projectId}/custom_fields/schema`;
};

export function ideaFormSchemaStream(
  projectId: string,
  phaseId?: string | null,
  inputId?: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = getInputFormsSchemaEndpoint(projectId, phaseId, inputId);
  return streams.get<IIdeaFormSchemas>({
    apiEndpoint,
    ...streamParams,
  });
}
