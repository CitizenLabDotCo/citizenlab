import { object, array, TestContext } from 'yup';

import { IMatrixStatementsType } from 'api/custom_fields/types';

const validateOneStatementForMatrix = (
  noStatementGenericMessage: string,
  everyStatementTitleMessage: string
) => {
  return array()
    .of(
      object().shape({
        title_multiloc: object(),
      })
    )
    .when('input_type', (input_type: string, schema) => {
      if (['matrix_linear_scale'].includes(input_type)) {
        return schema
          .test(
            'one-statement',
            noStatementGenericMessage,
            (matrix_statements: IMatrixStatementsType[]) => {
              return matrix_statements.some(
                (statement: IMatrixStatementsType) => {
                  return Object.values(statement.title_multiloc).some(
                    (value: string) => value !== ''
                  );
                }
              );
            }
          )
          .test(
            'every-statement-has-title',
            everyStatementTitleMessage,
            (
              matrix_statements: IMatrixStatementsType[],
              testContext: TestContext
            ) => {
              if (testContext.parent.key === 'topic_ids') {
                return true;
              }
              return matrix_statements.every(
                (statement: IMatrixStatementsType) => {
                  return (
                    Object.keys(statement.title_multiloc).length > 0 &&
                    Object.values(statement.title_multiloc).some(
                      (value: string) => value !== ''
                    )
                  );
                }
              );
            }
          );
      }
      return schema;
    });
};

export default validateOneStatementForMatrix;
