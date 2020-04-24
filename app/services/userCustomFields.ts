import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export type IInputType = 'text' | 'number' | 'multiline_text' | 'select' | 'multiselect' | 'checkbox' | 'date';

export interface IUserCustomFieldData {
  id: string;
  type: string;
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    input_type: IInputType;
    required: boolean;
    code: string | null;
    enabled: boolean;
    ordering: number;
    created_at: string;
    updated_at: string;
  };
  relationships?: {
    custom_field_options: {
      data: IRelationship;
    };
  };
}

export interface UserCustomFieldsInfos {
  schema: any;
  uiSchema: any;
  hasRequiredFields: boolean;
  hasCustomFields: boolean;
}

export function isBuiltInField(field: IUserCustomFieldData) {
  return !!field.attributes.code;
}

export interface IUserCustomField {
  data: IUserCustomFieldData;
}

export interface IUserCustomFields {
  data: IUserCustomFieldData[];
}

export interface IUserCustomFieldOptionsData {
  id: string;
  type: string;
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    ordering: number;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    custom_field_options: {
      data: IRelationship;
    };
  };
}

export interface IUserCustomFieldOptions {
  data: IUserCustomFieldOptionsData[];
}

export function customFieldForUsersStream(customFieldId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IUserCustomField>({ apiEndpoint: `${API_PATH}/users/custom_fields/${customFieldId}`, ...streamParams });
}

export function customFieldsForUsersStream(streamParams: IStreamParams | null = null) {
  return streams.get<IUserCustomFields>({ apiEndpoint: `${API_PATH}/users/custom_fields`, ...streamParams });
}

export function customFieldsSchemaForUsersStream(streamParams: IStreamParams | null = null) {
  return streams.get<any>({ apiEndpoint: `${API_PATH}/users/custom_fields/schema`, ...streamParams });
}

export function addCustomFieldForUsers(data) {
  return streams.add<IUserCustomField>(`${API_PATH}/users/custom_fields`, { custom_field: data });
}

export function updateCustomFieldForUsers(customFieldId: string, object) {
  return streams.update<IUserCustomField>(`${API_PATH}/users/custom_fields/${customFieldId}`, customFieldId, { custom_field: object });
}

export function reorderCustomFieldForUsers(customFieldId: string, object) {
  return streams.update<IUserCustomField>(`${API_PATH}/users/custom_fields/${customFieldId}/reorder`, customFieldId, { custom_field: object });
}

export function deleteUserCustomField(customFieldId: string) {
  return streams.delete(`${API_PATH}/users/custom_fields/${customFieldId}`, customFieldId);
}

export function userCustomFieldOptionsStream(customFieldId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IUserCustomFieldOptions>({ apiEndpoint: `${API_PATH}/users/custom_fields/${customFieldId}/custom_field_options`, ...streamParams });
}

export function addUserCustomFieldOption(customFieldId: string, data) {
  return streams.add<IUserCustomField>(`${API_PATH}/users/custom_fields/${customFieldId}/custom_field_options`, { custom_field_option: data });
}

export function updateUserCustomFieldOption(customFieldId: string, optionId: string, object) {
  return streams.update<IUserCustomFieldOptions>(`${API_PATH}/users/custom_fields/${customFieldId}/custom_field_options/${optionId}`, optionId, { custom_field_option: object });
}

export function deleteUserCustomFieldOption(customFieldId: string, optionId: string) {
  return streams.delete(`${API_PATH}/users/custom_fields/${customFieldId}/custom_field_options/${optionId}`, optionId);
}
