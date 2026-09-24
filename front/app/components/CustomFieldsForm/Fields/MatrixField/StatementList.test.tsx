import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import StatementList from './StatementList';

jest.mock('hooks/useLocalize', () =>
  jest.fn(() => (multiloc: { en: string }) => multiloc.en)
);

const statements = [
  { id: '1', key: 'statement_1', title_multiloc: { en: 'Statement 1' } },
  { id: '2', key: 'statement_2', title_multiloc: { en: 'Statement 2' } },
];
const columns = ['Disagree', 'Neutral', 'Agree'];

describe('StatementList', () => {
  it('renders every column as an option for every statement', () => {
    render(
      <StatementList
        id="matrix"
        statements={statements}
        columns={columns}
        onChange={jest.fn()}
      />
    );

    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(screen.getByText('Statement 1')).toBeInTheDocument();
    expect(screen.getByText('Statement 2')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(6);
  });

  it('merges the selected column into the existing value', async () => {
    const onChange = jest.fn();
    render(
      <StatementList
        id="matrix"
        statements={statements}
        columns={columns}
        value={{ statement_1: 1 }}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getAllByLabelText('Agree')[1]);

    expect(onChange).toHaveBeenCalledWith({ statement_1: 1, statement_2: 3 });
  });

  it('checks the radio matching the current value', () => {
    render(
      <StatementList
        id="matrix"
        statements={statements}
        columns={columns}
        value={{ statement_1: 2 }}
        onChange={jest.fn()}
      />
    );

    expect(screen.getAllByLabelText('Neutral')[0]).toBeChecked();
    expect(screen.getAllByLabelText('Neutral')[1]).not.toBeChecked();
  });
});
