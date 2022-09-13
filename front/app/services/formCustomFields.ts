import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

// We can add more input types here when we support them
export type ICustomFieldInputType = 'text' | 'multiselect';
export type IOptionsType = {
  id?: string;
  title_multiloc: Multiloc;
};

export interface IAttributes {
  key: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  input_type: ICustomFieldInputType;
  required: boolean;
  enabled: boolean;
  ordering: number;
  created_at: string;
  updated_at: string;
}

export interface ICustomFieldResponse {
  id: string;
  type: string;
  attributes: IAttributes;
  relationships: {
    options: {
      data: IRelationship[];
    };
  };
}

// This structure contains all response data from the API, includes more and is flattened to work with the differences in the body of the update structure and that of the get response
export type IFlatCustomField = Omit<
  ICustomFieldResponse,
  'attributes' | 'relationships'
> &
  IAttributes & {
    isLocalOnly?: boolean;
    options?: IOptionsType[];
  };

export type IFlatCustomFieldWithIndex = IFlatCustomField & {
  index: number;
};

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type IFlatCreateCustomField = Optional<
  IFlatCustomField,
  | 'description_multiloc'
  | 'type'
  | 'key'
  | 'options'
  | 'ordering'
  | 'created_at'
  | 'updated_at'
> & {
  isLocalOnly: boolean;
};

export interface ICustomFields {
  data: ICustomFieldResponse[];
}

export function formCustomFieldsStream(
  projectId: string,
  streamParams: IStreamParams | null = null,
  phaseId?: string
) {
  const apiEndpoint = phaseId
    ? `${API_PATH}/admin/phases/${phaseId}/custom_fields`
    : `${API_PATH}/admin/projects/${projectId}/custom_fields`;
  return streams.get<ICustomFields>({
    apiEndpoint,
    cacheStream: false,
    ...streamParams,
  });
}

export async function updateFormCustomFields(
  projectId: string,
  customFields,
  phaseId?: string
) {
  const apiEndpoint = phaseId
    ? `${API_PATH}/admin/phases/${phaseId}/custom_fields/update_all`
    : `${API_PATH}/admin/projects/${projectId}/custom_fields/update_all`;
  return streams.update(apiEndpoint, `${projectId}/custom_fields`, {
    custom_fields: customFields,
  });
}

export type OptionAttributes = Omit<
  IAttributes,
  'description_multiloc' | 'input_type' | 'required' | 'enabled'
>;

export interface IFormCustomFieldOptionData {
  id: string;
  type: string;
  attributes: OptionAttributes;
}

export interface IFormCustomFieldOption {
  data: IFormCustomFieldOptionData;
}

export function formCustomFieldOptionStream(
  projectId: string,
  customFieldId: string,
  customFieldOptionId: string,
  streamParams: IStreamParams | null = null,
  phaseId?: string
) {
  const apiEndpoint = phaseId
    ? `${API_PATH}/admin/phases/${phaseId}/custom_fields/${customFieldId}/custom_field_options/${customFieldOptionId}`
    : `${API_PATH}/admin/projects/${projectId}/custom_fields/${customFieldId}/custom_field_options/${customFieldOptionId}`;

  return streams.get<IFormCustomFieldOption>({
    apiEndpoint,
    ...streamParams,
  });
}

export interface Answer {
  answer: Multiloc;
  responses: number;
}

export interface Result {
  inputType: string;
  question: Multiloc;
  totalResponses: number;
  answers: Answer[];
}

export interface SurveyResultData {
  results: Result[];
  totalSubmissions: number;
}

export interface SurveyResultsType {
  data: SurveyResultData;
}

export function formCustomFieldsResultsStream(
  projectId: string,
  streamParams: IStreamParams | null = null,
  phaseId?: string
) {
  const apiEndpoint = phaseId
    ? `${API_PATH}/phases/${phaseId}/survey_results`
    : `${API_PATH}/projects/${projectId}/survey_results`;
  return streams.get<SurveyResultsType>({
    apiEndpoint,
    cacheStream: false,
    ...streamParams,
  });
}
