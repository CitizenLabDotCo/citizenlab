import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

// We can add more input types here when we support them
export type ICustomFieldInputType =
  | 'text'
  | 'multiline_text'
  | 'multiselect'
  | 'number'
  | 'select'
  | 'linear_scale'
  | 'section'
  | 'page'
  | 'file_upload'
  | 'title_multiloc'
  | 'html_multiloc'
  | 'files'
  | 'image_files'
  | 'topic_ids';

export type IOptionsType = {
  id?: string;
  title_multiloc: Multiloc;
  temp_id?: string;
};

export type QuestionRuleType = { if: string | number; goto_page_id: string };

export type LogicType = {
  rules?: QuestionRuleType[];
  next_page_id?: string;
};

export interface IAttributes {
  temp_id: string;
  logic: LogicType;
  key: string;
  code?: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  input_type: ICustomFieldInputType;
  required: boolean;
  isRequiredEditable?: boolean;
  isEnabledEditable?: boolean;
  isTitleEditable?: boolean;
  isDeleteEnabled?: boolean;
  constraints?: {
    locks: {
      title_multiloc?: boolean;
      enabled?: boolean;
      required?: boolean;
    };
  };
  enabled: boolean;
  ordering: number;
  created_at: string;
  updated_at: string;
  minimum_label_multiloc: Multiloc;
  maximum_label_multiloc: Multiloc;
  maximum: number;
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

const properties = [
  'id',
  'input_type',
  'description_multiloc',
  'required',
  'title_multiloc',
  'maximum_label_multiloc',
  'minimum_label_multiloc',
  'maximum',
  'options',
  'enabled',
  'index',
];

const doesOjectHaveProperties = (
  element: unknown,
  propertyNames: string[]
): boolean => {
  let hasProperties = true;
  propertyNames.forEach((propertyName) => {
    if (!Object.prototype.hasOwnProperty.call(element, propertyName)) {
      hasProperties = false;
    }
  });
  return hasProperties;
};

export const isNewCustomFieldObject = (
  element: unknown
): element is IFlatCustomFieldWithIndex =>
  doesOjectHaveProperties(element, properties);

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
  | 'minimum_label_multiloc'
  | 'maximum_label_multiloc'
  | 'maximum'
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
