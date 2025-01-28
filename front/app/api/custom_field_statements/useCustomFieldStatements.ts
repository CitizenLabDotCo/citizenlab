import { UseQueryOptions, useQueries } from '@tanstack/react-query';

import { ICustomFields } from 'api/custom_fields/types';
import { IIdeaCustomFieldData } from 'api/idea_custom_fields/types';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldStatementKeys from './keys';
import {
  ICustomFieldStatementParameters,
  IFormCustomFieldStatement,
} from './types';

const fetchCustomFieldStatements = ({
  projectId,
  phaseId,
  customFieldId,
  id,
}: ICustomFieldStatementParameters) => {
  const apiEndpoint = phaseId
    ? `admin/phases/${phaseId}/custom_fields/${customFieldId}/custom_field_matrix_statements/${id}`
    : `admin/projects/${projectId}/custom_fields/${customFieldId}/custom_field_matrix_statements/${id}`;

  return fetcher<IFormCustomFieldStatement>({
    path: `/${apiEndpoint}`,
    action: 'get',
  });
};

type CustomFieldStatements = Omit<ICustomFieldStatementParameters, 'id'> & {
  customFields?: ICustomFields | { data: IIdeaCustomFieldData[] };
};

type CustomFieldsStatementsReturnType =
  UseQueryOptions<IFormCustomFieldStatement>[];

const useCustomFieldStatements = ({
  projectId,
  phaseId,
  customFields,
}: CustomFieldStatements) => {
  const customFieldsStatementIds =
    customFields?.data.flatMap((customField) =>
      customField.relationships.matrix_statements?.data.map(
        (statement) => statement.id
      )
    ) || [];

  const getCustomFieldIdBasedOnStatementId = (statementId?: string) => {
    const customField = customFields?.data.find((customField) =>
      customField.relationships?.matrix_statements?.data.find(
        (statement) => statement.id === statementId
      )
    );
    return customField?.id;
  };

  const queries = customFieldsStatementIds.map((id) => {
    return {
      enabled: !!id,
      queryKey: customFieldStatementKeys.item({
        id,
      }),
      queryFn: () =>
        fetchCustomFieldStatements({
          projectId,
          phaseId,
          id,
          customFieldId: getCustomFieldIdBasedOnStatementId(id),
        }),
    };
  });

  return useQueries<CustomFieldsStatementsReturnType>({ queries });
};

export default useCustomFieldStatements;
