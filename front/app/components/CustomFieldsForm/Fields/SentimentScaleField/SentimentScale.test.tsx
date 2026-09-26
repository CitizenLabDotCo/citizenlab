import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, userEvent } from 'utils/testUtils/rtl';

import SentimentScaleField from './index';

const question = {
  key: 'experience',
  title_multiloc: { en: 'How was your experience?' },
  input_type: 'sentiment_linear_scale',
  required: false,
  ask_follow_up: false,
} as unknown as IFlatCustomField;

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

const option = (value: number) =>
  document.getElementById(`${question.key}-linear-scale-option-${value}`)!;

describe('SentimentScale', () => {
  it('can deselect an answer that was already set when the field mounted', async () => {
    // E.g. when navigating back to an earlier survey page
    renderComponent({ [question.key]: 3 });
    expect(option(3)).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(option(3));

    expect(option(3)).toHaveAttribute('aria-pressed', 'false');
  });
});
