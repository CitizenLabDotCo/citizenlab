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

const sentimentScaleField: IFlatCustomField = {
  id: 'experience-id',
  type: 'custom_field',
  key: 'experience',
  title_multiloc: { en: 'How was your experience?' },
  description_multiloc: {},
  input_type: 'sentiment_linear_scale',
  required: false,
  answers_visible_to: 'public',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  ask_follow_up: true,
  linear_scale_label_4_multiloc: { en: 'Good' },
};

const ratingField: IFlatCustomField = {
  id: 'quality-id',
  type: 'custom_field',
  key: 'quality',
  title_multiloc: { en: 'How good is the square today?' },
  description_multiloc: {},
  input_type: 'rating',
  required: false,
  answers_visible_to: 'public',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  maximum: 5,
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

  it('shows a sentiment scale answer as the selected option, a sentence and the follow-up text', () => {
    render(
      <AnswersForm
        answers={{ experience: 4, experience_follow_up: 'Friendly staff' }}
      >
        <AnswerValue field={sentimentScaleField} answer={4} />
      </AnswersForm>
    );

    expect(
      screen.getByRole('button', { name: '4 out of 5, Good', hidden: true })
    ).toHaveAttribute('aria-pressed', 'true');
    // The hidden emoji button carries the same text as its name, so look
    // for the sentence a screen reader actually gets.
    expect(
      screen.getByText('4 out of 5, Good', { ignore: '[aria-hidden="true"] *' })
    ).toBeInTheDocument();
    expect(screen.getByText('Friendly staff')).toBeInTheDocument();
    // The form's follow-up input must not be rendered, not even hidden
    expect(
      screen.queryByRole('textbox', { hidden: true })
    ).not.toBeInTheDocument();
  });

  it('shows a rating answer as the given stars and as a sentence', () => {
    render(
      <AnswersForm answers={{ quality: 3 }}>
        <AnswerValue field={ratingField} answer={3} />
      </AnswersForm>
    );

    expect(screen.getByRole('slider', { hidden: true })).toHaveAttribute(
      'aria-valuenow',
      '3'
    );
    expect(screen.getByText('3 out of 5')).toBeInTheDocument();
  });
});
