import React from 'react';

import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen } from 'utils/testUtils/rtl';

import SentimentScaleField from './index';

// Clicking the scale picks 4, or clears the answer when 4 is already picked.
jest.mock('./SentimentScale', () => ({ value, onChange }: any) => {
  const toggle = () => onChange(value === 4 ? null : 4);

  return (
    <div
      data-testid="sentiment-scale"
      onClick={toggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') toggle();
      }}
    >
      Sentiment Scale Mock
    </div>
  );
});

const renderComponent = (
  question: IFlatCustomField,
  defaultValues: Record<string, unknown> = { [question.key]: undefined }
) => {
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

describe('SentimentScaleField', () => {
  const baseQuestion: IFlatCustomField = {
    key: 'experience',
    title_multiloc: { en: 'How was your experience?' },
    input_type: 'linear_scale',
    required: false,
    ask_follow_up: true,
  } as any;

  it('does not show follow-up input initially', () => {
    renderComponent(baseQuestion);
    expect(
      screen.queryByPlaceholderText(/tell us why/i)
    ).not.toBeInTheDocument();
  });

  it('shows follow-up input when value is selected and ask_follow_up is true', async () => {
    renderComponent(baseQuestion);
    await userEvent.click(screen.getByTestId('sentiment-scale'));
    expect(
      await screen.findByPlaceholderText(/tell us why/i)
    ).toBeInTheDocument();
  });

  it('does not show follow-up input when ask_follow_up is false', async () => {
    renderComponent({ ...baseQuestion, ask_follow_up: false });
    await userEvent.click(screen.getByTestId('sentiment-scale'));
    expect(
      screen.queryByPlaceholderText(/tell us why/i)
    ).not.toBeInTheDocument();
  });

  // Default values are what a page remounted after back navigation starts
  // from. Clearing has to survive them, for the follow-up as much as for the
  // answer it belongs to.
  it('clears the follow-up answer when the answer is cleared', async () => {
    renderComponent(baseQuestion, {
      experience: 4,
      experience_follow_up: 'my reason',
    });

    await userEvent.click(screen.getByTestId('sentiment-scale'));
    expect(
      screen.queryByPlaceholderText(/tell us why/i)
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('sentiment-scale'));
    expect(await screen.findByPlaceholderText(/tell us why/i)).toHaveValue('');
  });
});
