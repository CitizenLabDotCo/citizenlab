import { IAttributes } from 'api/custom_fields/types';

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
  relationships: {
    image?: {
      data: {
        id: string;
        type: string;
      } | null;
    };
  };
}

export interface IFormCustomFieldOption {
  data: IFormCustomFieldOptionData;
}
