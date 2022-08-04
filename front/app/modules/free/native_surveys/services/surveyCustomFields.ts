import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export const surveyCustomFieldsSchemaApiEndpoint = `${API_PATH}/users/custom_fields/schema`;
export const surveyCustomFieldsJSONSchemaApiEndpoint = `${API_PATH}/users/custom_fields/json_forms_schema`;

// Please note that the structure is bound to change once we move to the custom idea api.
// We are using the user custom fields api for now to make progress on the frontend
export type ISurveyCustomFieldInputType =
  | 'text'
  | 'number'
  | 'multiline_text'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'date';

export interface ISurveyCustomFieldData {
  id: string;
  type: string;
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    input_type: ISurveyCustomFieldInputType;
    required: boolean;
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

export interface ISurveyCustomField {
  data: ISurveyCustomFieldData;
}

export interface ISurveyCustomFields {
  data: ISurveyCustomFieldData[];
}

export function surveyCustomFieldsStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<ISurveyCustomFields>({
    apiEndpoint: `${API_PATH}/users/custom_fields`,
    ...streamParams,
  });
}

export function addSurveyCustomField(data) {
  return streams.add<ISurveyCustomField>(`${API_PATH}/users/custom_fields`, {
    custom_field: data,
  });
}

export function updateSurveyCustomField(customFieldId: string, object) {
  return streams.update<ISurveyCustomField>(
    `${API_PATH}/users/custom_fields/${customFieldId}`,
    customFieldId,
    { custom_field: object }
  );
}

export function reorderSurveyCustomField(customFieldId: string, object) {
  return streams.update<ISurveyCustomField>(
    `${API_PATH}/users/custom_fields/${customFieldId}/reorder`,
    customFieldId,
    { custom_field: object }
  );
}

export function deleteSurveyCustomField(customFieldId: string) {
  return streams.delete(
    `${API_PATH}/users/custom_fields/${customFieldId}`,
    customFieldId
  );
}
