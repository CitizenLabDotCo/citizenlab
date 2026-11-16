import React from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import SentimentScale from './SentimentScale';

const question: IFlatCustomField = {
  id: 'experience-id',
  type: 'custom_field',
  key: 'experience',
  title_multiloc: { en: 'How was your experience?' },
  description_multiloc: {},
  input_type: 'sentiment_linear_scale',
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  ask_follow_up: false,
};

// The emoji is hidden from screen readers, so an option is named by the text
// only they get: "<value> out of <maximum>"
const option = (value: number) =>
  screen.getByRole('button', { name: `${value} out of 5` });

describe('SentimentScale disabled', () => {
  it('ignores clicks and takes no tab stop', async () => {
    const onChange = jest.fn();
    render(
      <SentimentScale
        question={question}
        value={3}
        onChange={onChange}
        disabled
      />
    );

    await userEvent.click(option(4));

    expect(onChange).not.toHaveBeenCalled();
    expect(option(4)).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('slider')).not.toHaveAttribute('tabindex');
  });
});
