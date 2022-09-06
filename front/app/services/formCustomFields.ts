import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

// We can add more input types here when we support them
export type ICustomFieldInputType = 'text' | 'multiselect' | 'number' | 'email' | 'linear_scale';
export type IOptionsType = {
  id?: string;
  title_multiloc: Multiloc;
};

export interface IAttributes {
  key: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  options: [IOptionsType];
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
}

// This structure contains all response data from the API, includes more and is flattened to work with the differences in the body of the update structure and that of the get response
export type IFlatCustomField = Omit<ICustomFieldResponse, 'attributes'> &
  IAttributes & {
    isLocalOnly?: boolean;
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
