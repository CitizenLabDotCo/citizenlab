export interface ICustomFieldStatementParameters {
  id?: string;
  projectId: string;
  phaseId?: string;
  customFieldId?: string;
}

export type StatementAttributes = {
  title_multiloc: {
    [locale: string]: string;
  };
  key: string;
  ordering: number;
  created_at: string;
  updated_at: string;
  temp_id?: string;
};

export interface IFormCustomFieldStatementData {
  id: string;
  type: 'custom_field_matrix_statement';
  attributes: StatementAttributes;
}

export interface IFormCustomFieldStatement {
  data: IFormCustomFieldStatementData;
}
