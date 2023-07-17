import { Keys } from 'utils/cl-react-query/types';
import customFieldsKeys from './keys';
import { IAttributes } from 'api/custom_fields/types';

export type CustomFieldsKeys = Keys<typeof customFieldsKeys>;

export interface ICustomFieldOptionParameters {
  id: string;
  projectId: string;
  phaseId?: string;
  customFieldId?: string;
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
