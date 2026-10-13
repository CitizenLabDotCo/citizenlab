import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import LinearScaleField from './index';

const question: IFlatCustomField = {
  id: 'satisfaction-id',
  type: 'custom_field',
  key: 'satisfaction',
  title_multiloc: { en: 'How satisfied are you?' },
  description_multiloc: {},
  input_type: 'linear_scale',
  required: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  maximum: 5,
};

const renderComponent = (defaultValues: Record<string, unknown>) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues });

    return (
      <FormProvider {...methods}>
        <LinearScaleField question={question} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

// Each option is labelled with its own number when the question sets no labels
const option = (value: number) =>
  screen.getByRole('radio', { name: `${value}` });

describe('LinearScaleField', () => {
  it('can deselect an answer that was already set when the field mounted', async () => {
    // E.g. when navigating back to an earlier survey page
    renderComponent({ [question.key]: 3 });
    expect(option(3)).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(option(3));

    expect(option(3)).toHaveAttribute('aria-checked', 'false');
  });
});
