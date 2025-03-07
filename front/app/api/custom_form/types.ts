import { Keys } from 'utils/cl-react-query/types';

import customFormKeys from './keys';

export type CustomFormKeys = Keys<typeof customFormKeys>;

export interface ICustomFormParameters {
  projectId: string;
  phaseId?: string;
}

export type CustomFormAttributes = {
  opened_at: string;
  updated_at: string;
};

export interface ICustomFormData {
  id: string;
  type: string;
  attributes: CustomFormAttributes;
}

export interface ICustomForm {
  data: ICustomFormData;
}
