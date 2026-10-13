import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import SentimentScaleField from './index';

const question: IFlatCustomField = {
  id: 'experience-id',
  type: 'custom_field',
  key: 'experience',
  title_multiloc: { en: 'How was your experience?' },
  description_multiloc: {},
  input_type: 'sentiment_linear_scale',
  required: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  ask_follow_up: false,
};

const renderComponent = (defaultValues: Record<string, unknown>) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues });

    return (
      <FormProvider {...methods}>
        <SentimentScaleField question={question} scrollErrorIntoView={false} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

// The emoji is hidden from screen readers, so an option is named by the text
// only they get: "<value> out of <maximum>"
const option = (value: number) =>
  screen.getByRole('button', { name: `${value} out of 5` });

describe('SentimentScaleField deselect', () => {
  it('can deselect an answer that was already set when the field mounted', async () => {
    // E.g. when navigating back to an earlier survey page
    renderComponent({ [question.key]: 3 });
    expect(option(3)).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(option(3));

    expect(option(3)).toHaveAttribute('aria-pressed', 'false');
  });
});
