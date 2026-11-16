import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import ImageMultichoiceField from './index';

const question: IFlatCustomField = {
  id: 'surface-id',
  type: 'custom_field',
  key: 'surface',
  title_multiloc: { en: 'Which surface fits the square best?' },
  description_multiloc: {},
  input_type: 'multiselect_image',
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  options: [
    { key: 'cobbles', title_multiloc: { en: 'Cobbles' } },
    { key: 'grass', title_multiloc: { en: 'Grass' } },
  ],
};

const renderComponent = (
  defaultValues: Record<string, unknown>,
  disabled = false
) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues });

    return (
      <FormProvider {...methods}>
        <ImageMultichoiceField question={question} disabled={disabled} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

describe('ImageMultichoiceField', () => {
  it('checks a clicked option', async () => {
    renderComponent({ [question.key]: ['cobbles'] });
    const [cobbles, grass] = screen.getAllByRole('checkbox');

    await userEvent.click(grass);

    expect(cobbles).toBeChecked();
    expect(grass).toBeChecked();
  });

  it('ignores clicks when disabled', async () => {
    renderComponent({ [question.key]: ['cobbles'] }, true);
    const [cobbles, grass] = screen.getAllByRole('checkbox');

    await userEvent.click(grass);

    expect(cobbles).toBeChecked();
    expect(grass).not.toBeChecked();
    expect(grass).toBeDisabled();
  });
});
