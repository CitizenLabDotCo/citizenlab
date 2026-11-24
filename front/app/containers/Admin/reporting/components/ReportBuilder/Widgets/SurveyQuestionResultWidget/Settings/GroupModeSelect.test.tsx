import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import GroupModeSelect from './GroupModeSelect';

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

const optionValues = () =>
  screen.getAllByRole('option').map((option) => option.getAttribute('value'));

describe('<GroupModeSelect />', () => {
  it('offers grouping by a demographic question', () => {
    render(<GroupModeSelect allowUserField onChange={jest.fn()} />);

    expect(optionValues()).toEqual(['', 'user_field', 'survey_question']);
  });

  it('drops the demographic question option when it is not allowed', () => {
    render(<GroupModeSelect allowUserField={false} onChange={jest.fn()} />);

    expect(optionValues()).toEqual(['', 'survey_question']);
  });
});
