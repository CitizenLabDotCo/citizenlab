import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';


export type IInputType = 'text' | 'multiline_text' | 'select' | 'multiselect' | 'checkbox' | 'date';

export interface ICustomFieldData {
  id: string;
  type: string;
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    input_type: IInputType;
    required: boolean;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    custom_field_options: {
      data: IRelationship;
    };
  };
}

export interface ICustomField {
  data: ICustomFieldData;
}

export interface ICustomFields {
  data: ICustomFieldData[];
}

export function customFieldForUsersStream(customFieldId: string, streamParams: IStreamParams | null = null) {
  return streams.get<ICustomField>({ apiEndpoint: `${API_PATH}/users/custom_fields/${customFieldId}`, ...streamParams });
}

export function customFieldsForUsersStream(streamParams: IStreamParams | null = null) {
  return streams.get<ICustomFields>({ apiEndpoint: `${API_PATH}/users/custom_fields`, ...streamParams });
}

export function addCustomFieldForUsers(data) {
  return streams.add<ICustomField>(`${API_PATH}/users/custom_fields`, { custom_field: data });
}

export function updateCustomFieldForUsers(customFieldId: string, object) {
  return streams.update<ICustomField>(`${API_PATH}/users/custom_fields/${customFieldId}`, customFieldId, { custom_field: object });
}

export function deleteCustomField(customFieldId: string) {
  return streams.delete(`${API_PATH}/users/custom_fields/${customFieldId}`, customFieldId);
}
