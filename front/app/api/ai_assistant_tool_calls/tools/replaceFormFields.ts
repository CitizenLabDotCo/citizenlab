import { Multiloc } from 'typings';

import { ICustomFieldInputType } from 'api/custom_fields/types';

export type AiAssistantFormField = {
  id?: string;
  key?: string | null;
  input_type?: ICustomFieldInputType;
  title_multiloc?: Multiloc;
  required?: boolean;
};

export type ReplaceFormFieldsArguments = { fields: AiAssistantFormField[] };
