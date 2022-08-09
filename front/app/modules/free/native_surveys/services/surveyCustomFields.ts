import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export const surveyCustomFieldsSchemaApiEndpoint = `${API_PATH}/users/custom_fields/schema`;
export const surveyCustomFieldsJSONSchemaApiEndpoint = `${API_PATH}/users/custom_fields/json_forms_schema`;
export const surveyCustomFieldsEndpoint = `${API_PATH}/users/custom_fields/json_forms_schema`;

// Please note that the structure is bound to change once we move to the custom idea api.
// We are using the user custom fields api for now to make progress on the frontend
export type ICustomFieldInputType =
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
    input_type: ICustomFieldInputType;
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
  isLocalOnly?: boolean;
}

export interface ICustomField {
  id: string;
  input_type: ICustomFieldInputType;
  required: boolean;
  enabled: boolean;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export interface ICustomFields {
  custom_fields: ICustomField[];
}

type NestedKeys<T extends string, U extends string[]> = {
  [K in keyof U]: U[K] extends `${T}.${infer V}` ? V : never;
};

type PartialExcept<T, U extends string[]> = {
  [K in keyof T as K extends U[number] ? K : never]?: T[K];
} & {
  [K in keyof T as K extends U[number] ? never : K]: K extends string
    ? PartialExcept<T[K], NestedKeys<K, U>>
    : T[K];
};

export type ISurveyCustomFieldAdd = {
  id: string;
} & PartialExcept<
  ISurveyCustomFieldData,
  [
    'id',
    'type',
    'attributes.key',
    'attributes.required',
    'attributes.input_type',
    'attributes.hidden',
    'attributes.enabled',
    'attributes.ordering',
    'attributes.created_at',
    'attributes.updated_at'
  ]
>;

export type ISurveyCustomFieldUpdate = PartialExcept<
  ISurveyCustomFieldAdd,
  ['attributes.input_type', 'isLocalOnly']
>;

export interface ISurveyCustomField {
  data: ISurveyCustomFieldData;
}

export interface ISurveyCustomFields {
  data: ISurveyCustomFieldData[];
}

export function surveyCustomFieldsStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/admin/projects/${projectId}/custom_fields`;
  return streams.get<ISurveyCustomFields>({
    apiEndpoint,
    ...streamParams,
  });
}

export async function updateSurveyCustomFields(projectId: string, array) {
  const apiEndpoint = `${API_PATH}/admin/projects/${projectId}/custom_fields/update_all`;
  return streams.update<ICustomFields>(
    apiEndpoint,
    `${projectId}/custom_fields`,
    {
      custom_fields: array,
    }
  );
}

export function deleteSurveyCustomField(customFieldId: string) {
  return streams.delete(
    `${API_PATH}/users/custom_fields/${customFieldId}`,
    customFieldId
  );
}
