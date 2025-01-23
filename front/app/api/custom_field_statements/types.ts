import { IAttributes } from 'api/custom_fields/types';

import { Keys } from 'utils/cl-react-query/types';

import customFieldStatementKeys from './keys';

export interface ICustomFieldStatementParameters {
  id?: string;
  projectId: string;
  phaseId?: string;
  customFieldId?: string;
}
export type StatementAttributes = Omit<
  IAttributes,
  'description_multiloc' | 'input_type' | 'required' | 'enabled'
>;

export interface IFormCustomFieldStatementData {
  id: string;
  type: string;
  attributes: StatementAttributes;
}

export interface IFormCustomFieldStatement {
  data: IFormCustomFieldStatementData;
}

export type CustomFieldStatementKeys = Keys<typeof customFieldStatementKeys>;
