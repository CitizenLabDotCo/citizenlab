import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import MatrixField from './index';

const question = {
  key: 'agreement',
  title_multiloc: { en: 'Do you agree?' },
  input_type: 'matrix_linear_scale',
  required: false,
  maximum: 3,
  matrix_statements: [
    { id: '1', key: 'statement_1', title_multiloc: { en: 'Statement 1' } },
  ],
} as unknown as IFlatCustomField;

const renderComponent = (defaultValues: Record<string, unknown>) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues });

    return (
      <FormProvider {...methods}>
        <MatrixField question={question} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

describe('MatrixField', () => {
  it('can clear answers that were already set when the field mounted', async () => {
    // E.g. when navigating back to an earlier survey page
    renderComponent({ [question.key]: { statement_1: 2 } });

    await userEvent.click(screen.getByText('Clear all'));

    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });
});
