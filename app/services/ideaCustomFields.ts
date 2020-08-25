import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

export type Visibility = 'admins' | 'public';
export type CustomFieldCodes =
  | 'title'
  | 'body'
  | 'topic_ids'
  | 'location'
  | 'images'
  | 'attachments'
  | 'proposed_budget';
type CustomFieldKeys = CustomFieldCodes;

export interface IIdeaCustomFieldData {
  id: string;
  type: 'custom_field';
  attributes: {
    key: CustomFieldKeys;
    input_type: 'text' | 'multiselect' | 'custom';
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    required: boolean;
    ordering: null;
    enabled: boolean;
    code: CustomFieldCodes;
    created_at: null;
    updated_at: null;
    visible_to: Visibility;
  };
}

export interface IIdeaCustomField {
  data: IIdeaCustomFieldData;
}

export interface IIdeaCustomFields {
  data: IIdeaCustomFieldData[];
}

export interface IUpdatedIdeaCustomFieldProperties {
  description_multiloc?: Multiloc;
  enabled?: boolean;
  required?: boolean;
  visible_to?: Visibility;
}

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

export interface IIdeaCustomFieldsSchemas {
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

export function ideaCustomFieldsStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/custom_fields`;
  return streams.get<IIdeaCustomFields>({ apiEndpoint, ...streamParams });
}

export function ideaCustomFieldByCodeStream(
  projectId: string,
  customFieldCode: CustomFieldCodes,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/custom_fields/by_code/${customFieldCode}`;
  return streams.get<IIdeaCustomField>({ apiEndpoint, ...streamParams });
}

export function ideaCustomFieldsSchemasStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/custom_fields/schema`;
  return streams.get<IIdeaCustomFieldsSchemas>({
    apiEndpoint,
    ...streamParams,
  });
}

export function ideaCustomFieldStream(
  projectId: string,
  ideaCustomFieldId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/custom_fields/${ideaCustomFieldId}`;
  return streams.get<IIdeaCustomField>({ apiEndpoint, ...streamParams });
}

export function updateIdeaCustomField(
  projectId: string,
  ideaCustomFieldId: string,
  code: string,
  object: IUpdatedIdeaCustomFieldProperties
) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/custom_fields/by_code/${code}`;
  const updateObject = { custom_field: object };
  return streams.update<IIdeaCustomField>(
    apiEndpoint,
    ideaCustomFieldId,
    updateObject
  );
}
