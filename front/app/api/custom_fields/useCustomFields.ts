import { useMemo } from 'react';

import { IFormCustomFieldStatementData } from 'api/custom_field_statements/types';
import { IMatrixStatementsType } from 'api/custom_fields/types';

import { groupIncludedResources } from 'utils/cl-react-query/groupIncludedResources';

import { ICustomFieldsParameters, IFlatCustomField } from './types';
import useRawCustomFields from './useRawCustomFields';

const useCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
  copy,
  publicFields = false,
}: ICustomFieldsParameters) => {
  const result = useRawCustomFields({
    projectId,
    phaseId,
    inputTypes,
    copy,
    publicFields,
  });

  const includedByType = useMemo(() => {
    const included = result.data?.included;
    if (!included) return undefined;

    return groupIncludedResources(included);
  }, [result]);

  const options = includedByType?.custom_field_option ?? [];
  const statements = includedByType?.custom_field_matrix_statement ?? [];

  const statementsById = statements.reduce((acc, statement) => {
    const id = statement.id;
    acc[id] = statement;
    return acc;
  }, {} as Record<string, IFormCustomFieldStatementData>);

  const statementsByCustomFieldId = result.data?.data.reduce(
    (acc, customField) => {
      if (!customField.relationships.matrix_statements) return acc;

      const statementIds = customField.relationships.matrix_statements.data.map(
        (statement) => statement.id
      );

      acc[customField.id] = statementIds.map((id) => statementsById[id]);
      return acc;
    },
    {} as Record<string, IFormCustomFieldStatementData[]>
  );

  const data: IFlatCustomField[] | undefined = result.data?.data.map(
    (customField) => {
      const optionsForCustomField = options.filter((option) => {
        const relationshipOptionIds =
          customField.relationships.options.data.map((option) => option.id);

        return (
          option.id &&
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          relationshipOptionIds.includes(option.id)
        );
      });

      const statementsForCustomField =
        statementsByCustomFieldId?.[customField.id] ?? [];
      const convertedStatements: IMatrixStatementsType[] =
        statementsForCustomField.map((statement) => ({
          id: statement.id,
          key: statement.attributes.key,
          title_multiloc: statement.attributes.title_multiloc,
          temp_id: statement.attributes.temp_id,
        }));

      return {
        ...customField,
        ...customField.attributes,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        map_config: customField.relationships?.map_config,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        map_config_id: customField.relationships?.map_config?.data?.id,
        matrix_statements: convertedStatements,
        options:
          optionsForCustomField.length > 0
            ? optionsForCustomField.map((option) => ({
                id: option.id,
                key: option.attributes.key,
                title_multiloc: option.attributes.title_multiloc,
                other: option.attributes.other || false,
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                image_id: option.relationships.image?.data?.id,
                temp_id: option.attributes.temp_id,
              }))
            : [],
      };
    }
  );

  return { ...result, data };
};

export default useCustomFields;
