import React from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Ranking from './Ranking';

const question: IFlatCustomField = {
  id: 'priorities-id',
  type: 'custom_field',
  key: 'priorities',
  title_multiloc: { en: 'Rank these priorities' },
  description_multiloc: {},
  input_type: 'ranking',
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  options: [
    { id: '1', key: 'housing', title_multiloc: { en: 'Housing' } },
    { id: '2', key: 'mobility', title_multiloc: { en: 'Mobility' } },
  ],
};

describe('Ranking', () => {
  it('moves an option by choosing its rank and offers Clear all', async () => {
    const onChange = jest.fn();
    render(
      <Ranking
        question={question}
        value={['mobility', 'housing']}
        onChange={onChange}
      />
    );

    const [, housingRank] = screen.getAllByRole('combobox');
    await userEvent.selectOptions(housingRank, '1');

    expect(onChange).toHaveBeenCalledWith(['housing', 'mobility']);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Drag to reorder/)).toHaveLength(2);
  });

  it('disables the ranks and hides the handles, instructions and Clear all when disabled', () => {
    render(
      <Ranking
        question={question}
        value={['mobility', 'housing']}
        onChange={jest.fn()}
        disabled
      />
    );

    const [mobilityRank, housingRank] = screen.getAllByRole('combobox');
    expect(mobilityRank).toHaveValue('1');
    expect(housingRank).toHaveValue('2');
    expect(mobilityRank).toBeDisabled();
    expect(housingRank).toBeDisabled();
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Drag to reorder/)).not.toBeInTheDocument();
    expect(
      screen.queryByText('Drag and drop to rank options.')
    ).not.toBeInTheDocument();
  });
});
