import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import customFormKeys from './keys';

export type CustomFormKeys = Keys<typeof customFormKeys>;

export type CustomFormAttributes = {
  opened_at: string;
  fields_last_updated_at: string;
  print_start_multiloc: Multiloc;
  print_end_multiloc: Multiloc;
};

export interface ICustomFormData {
  id: string;
  type: string;
  attributes: CustomFormAttributes;
}

export interface ICustomForm {
  data: ICustomFormData;
}
