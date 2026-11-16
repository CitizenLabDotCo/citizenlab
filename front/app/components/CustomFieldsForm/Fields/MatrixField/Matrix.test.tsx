import React from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Matrix from './Matrix';

const question: IFlatCustomField = {
  id: 'agreement-id',
  type: 'custom_field',
  key: 'agreement',
  title_multiloc: { en: 'Do you agree?' },
  description_multiloc: {},
  input_type: 'matrix_linear_scale',
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  maximum: 3,
  matrix_statements: [
    { id: '1', key: 'statement_1', title_multiloc: { en: 'Statement 1' } },
  ],
};

describe('Matrix', () => {
  it('selects a column by click and offers Clear all', async () => {
    const onChange = jest.fn();
    render(
      <Matrix
        question={question}
        value={{ statement_1: 2 }}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getAllByRole('radio')[2]);

    expect(onChange).toHaveBeenCalledWith({ statement_1: 3 });
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('ignores clicks and hides Clear all when disabled', async () => {
    const onChange = jest.fn();
    render(
      <Matrix
        question={question}
        value={{ statement_1: 2 }}
        onChange={onChange}
        disabled
      />
    );

    const [first, second, third] = screen.getAllByRole('radio');
    await userEvent.click(third);

    expect(onChange).not.toHaveBeenCalled();
    expect(second).toBeChecked();
    expect(first).toBeDisabled();
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });
});
