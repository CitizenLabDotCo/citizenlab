import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Locale, Multiloc } from 'typings';
import { JsonSchema7, Layout } from '@jsonforms/core';

const userCustomFieldsSchemaApiEndpoint = `${API_PATH}/users/custom_fields/schema`;
const userCustomFieldsJSONSchemaApiEndpoint = `${API_PATH}/users/custom_fields/json_forms_schema`;

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

export interface UserCustomFieldsInfos {
  schema: any;
  uiSchema: any;
  hasRequiredFields: boolean;
  hasCustomFields: boolean;
}

interface IUserCustomFieldSchemas {
  data: {
    attributes: {
      json_schema_multiloc: {
        [key in Locale]?: any;
      };
      ui_schema_multiloc: {
        [key in Locale]?: any;
      };
    };
  };
}

export interface IUserJsonFormSchemas {
  data: {
    attributes: {
      json_schema_multiloc: {
        [key in Locale]?: JsonSchema7;
      };
      ui_schema_multiloc: { [key in Locale]?: Layout };
    };
  };
}

export function isBuiltInField(field: IUserCustomFieldData) {
  return !!field.attributes.code;
}

export function isHiddenField(field: IUserCustomFieldData) {
  return !!field.attributes.hidden;
}

export interface IUserCustomField {
  data: IUserCustomFieldData;
}

export interface IUserCustomFields {
  data: IUserCustomFieldData[];
}

export function userCustomFieldStream(
  customFieldId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUserCustomField>({
    apiEndpoint: `${API_PATH}/users/custom_fields/${customFieldId}`,
    ...streamParams,
  });
}

export function userCustomFieldsStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUserCustomFields>({
    apiEndpoint: `${API_PATH}/users/custom_fields`,
    ...streamParams,
  });
}

export function customFieldsSchemaForUsersStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUserCustomFieldSchemas>({
    apiEndpoint: userCustomFieldsSchemaApiEndpoint,
    ...streamParams,
  });
}

export function userJsonFormSchemasStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUserJsonFormSchemas>({
    apiEndpoint: userCustomFieldsJSONSchemaApiEndpoint,
    ...streamParams,
  });
}

export async function addCustomFieldForUsers(data) {
  const response = await streams.add<IUserCustomField>(
    `${API_PATH}/users/custom_fields`,
    {
      custom_field: data,
    }
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      userCustomFieldsSchemaApiEndpoint,
      userCustomFieldsJSONSchemaApiEndpoint,
    ],
  });

  return response;
}

export async function updateCustomFieldForUsers(customFieldId: string, object) {
  const response = await streams.update<IUserCustomField>(
    `${API_PATH}/users/custom_fields/${customFieldId}`,
    customFieldId,
    { custom_field: object }
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      userCustomFieldsSchemaApiEndpoint,
      userCustomFieldsJSONSchemaApiEndpoint,
    ],
  });

  return response;
}

export async function reorderCustomFieldForUsers(
  customFieldId: string,
  object
) {
  const response = await streams.update<IUserCustomField>(
    `${API_PATH}/users/custom_fields/${customFieldId}/reorder`,
    customFieldId,
    { custom_field: object }
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      userCustomFieldsSchemaApiEndpoint,
      userCustomFieldsJSONSchemaApiEndpoint,
    ],
  });

  return response;
}

export async function deleteUserCustomField(customFieldId: string) {
  const response = await streams.delete(
    `${API_PATH}/users/custom_fields/${customFieldId}`,
    customFieldId
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      userCustomFieldsSchemaApiEndpoint,
      userCustomFieldsJSONSchemaApiEndpoint,
    ],
  });

  return response;
}
