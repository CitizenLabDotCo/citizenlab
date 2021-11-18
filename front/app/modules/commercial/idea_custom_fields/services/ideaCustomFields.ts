import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';
import { CustomFieldCodes } from 'services/ideaCustomFieldsSchemas';

export type Visibility = 'admins' | 'public';
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

export function ideaCustomFieldsStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/custom_fields`;
  return streams.get<IIdeaCustomFields>({ apiEndpoint, ...streamParams });
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
