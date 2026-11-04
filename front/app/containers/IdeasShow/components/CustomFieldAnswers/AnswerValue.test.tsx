import React from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen } from 'utils/testUtils/rtl';

import AnswersForm from './AnswersForm';
import AnswerValue from './AnswerValue';

const linearScaleField: IFlatCustomField = {
  id: 'satisfaction-id',
  type: 'custom_field',
  key: 'satisfaction',
  title_multiloc: { en: 'How satisfied are you?' },
  description_multiloc: {},
  input_type: 'linear_scale',
  required: false,
  answers_visible_to: 'public',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  maximum: 5,
  linear_scale_label_3_multiloc: { en: 'Neutral' },
};

describe('AnswerValue', () => {
  it('shows a linear scale answer as the selected option and as a sentence', () => {
    render(
      <AnswersForm answers={{ satisfaction: 3 }}>
        <AnswerValue field={linearScaleField} answer={3} />
      </AnswersForm>
    );

    expect(
      screen.getByRole('radio', { name: '3 - Neutral', hidden: true })
    ).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('3 out of 5, Neutral')).toBeInTheDocument();
  });
});
