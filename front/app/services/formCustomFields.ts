import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

// We can add more input types here when we support them
export type ICustomFieldInputType = 'text';

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
}

// This structure contains all response data from the API, includes more and is flattened to work with the differences in the body of the update structure and that of the get response
export type IFlatCustomField = Omit<ICustomFieldResponse, 'attributes'> &
  IAttributes & {
    isLocalOnly?: boolean;
  };

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type IFlatCreateCustomField = Optional<
  IFlatCustomField,
  | 'description_multiloc'
  | 'type'
  | 'key'
  | 'ordering'
  | 'created_at'
  | 'updated_at'
> & {
  isLocalOnly: boolean;
};

export type IFlatUpdateCustomField = Optional<
  IFlatCreateCustomField,
  'isLocalOnly' | 'input_type'
>;

export interface ICustomFields {
  data: ICustomFieldResponse[];
}

export function formCustomFieldsStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/admin/projects/${projectId}/custom_fields`;
  return streams.get<ICustomFields>({
    apiEndpoint,
    cacheStream: false,
    ...streamParams,
  });
}

export async function updateFormCustomFields(projectId: string, customFields) {
  const apiEndpoint = `${API_PATH}/admin/projects/${projectId}/custom_fields/update_all`;
  return streams.update(apiEndpoint, `${projectId}/custom_fields`, {
    custom_fields: customFields,
  });
}
