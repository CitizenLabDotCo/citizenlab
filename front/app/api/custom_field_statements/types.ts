import { IAttributes } from 'api/custom_fields/types';

export interface ICustomFieldStatementParameters {
  id: string;
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
  relationships: {
    image: {
      data: {
        id: string;
        type: string;
      } | null;
    };
  };
}

export interface IFormCustomFieldStatement {
  data: IFormCustomFieldStatementData;
}
