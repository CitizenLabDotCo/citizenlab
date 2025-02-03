import { object } from 'yup';

import validateOneStatementForMatrix from './validateOneStatementForMatrix';

describe('validateOneStatementForMatrix', () => {
  const schema = object().shape({
    matrix_statements: validateOneStatementForMatrix(
      'Minimum one statement needed',
      'Every statement needs title'
    ),
  });

  it('should return an error if a statement is missing a title', async () => {
    const result = await schema.isValid({
      matrix_statements: [
        {
          id: '3671a97e-31bc-4206-95cd-b5fd03e8ce1d',
          title_multiloc: '',
        },
      ],
    });
    expect(result).toBe(false);

    const error = await schema
      .validate({
        matrix_statements: [
          {
            id: '3671a97e-31bc-4206-95cd-b5fd03e8ce1d',
            title_multiloc: '',
          },
        ],
      })
      .catch((err) => err);
    expect(error.message).toContain(
      'matrix_statements[0].title_multiloc must be a `object` type'
    );
  });

  it('should be valid if all statements are valid', async () => {
    const result = await schema.isValid({
      matrix_statements: [
        {
          id: '3671a97e-31bc-4206-95cd-b5fd03e8ce1d',
          title_multiloc: {
            en: 'Statememt #1',
          },
        },
        {
          id: '5d045dbb-3a2e-49f9-b5e2-fc7c88f09ee5',
          title_multiloc: {
            en: 'Statememt #2',
          },
        },
      ],
    });
    expect(result).toBe(true);
  });
});
