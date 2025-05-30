import useCustomFieldOptionsBulk from 'api/custom_field_options/useCustomFieldOptionsBulk';
import useCustomFieldStatements from 'api/custom_field_statements/useCustomFieldStatements';

import { ICustomFieldsParameters, IFlatCustomField } from './types';
import useRawCustomFields from './useRawCustomFields';
import { IFormCustomFieldStatementData } from 'api/custom_field_statements/types';
import { IMatrixStatementsType } from 'api/custom_fields/types';

const useCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
  copy,
}: ICustomFieldsParameters) => {
  const result = useRawCustomFields({ projectId, phaseId, inputTypes, copy });

  const options = useCustomFieldOptionsBulk({
    customFields: result.data,
  });

  const statements = useCustomFieldStatements({
    projectId,
    phaseId,
    customFields: result.data,
  });

  const statementsById = statements.reduce((acc, statement) => {
    if (!statement.data) return acc;

    const id = statement.data.data.id;
    acc[id] = statement.data.data;
    return acc;
  }, {} as Record<string, IFormCustomFieldStatementData>);

  const statementsByCustomFieldId = result.data?.data.reduce(
    (acc, customField) => {
      if (!customField.relationships.matrix_statements) return acc;

      const statementIds =
        customField.relationships.matrix_statements?.data.map(
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
          option.data?.data.id &&
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          relationshipOptionIds.includes(option.data?.data.id)
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
                id: option.data?.data.id,
                key: option.data?.data.attributes.key,
                title_multiloc:
                  option.data?.data.attributes.title_multiloc || {},
                other: option.data?.data.attributes.other || false,
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                image_id: option.data?.data.relationships.image?.data?.id,
                temp_id: option.data?.data.attributes.temp_id,
              }))
            : [],
      };
    }
  );

  return { ...result, data };
};

export default useCustomFields;
