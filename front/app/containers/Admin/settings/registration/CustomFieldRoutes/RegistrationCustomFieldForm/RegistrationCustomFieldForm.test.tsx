import React from 'react';

import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';

import RegistrationCustomFieldForm, { FormValues } from '.';

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

const defaultValues = (overrides: Partial<FormValues> = {}): FormValues => ({
  input_type: 'text',
  title_multiloc: { en: 'House number' },
  description_multiloc: {},
  required: true,
  enabled: true,
  min_characters: null,
  max_characters: null,
  ...overrides,
});

const minInput = () => screen.queryByLabelText('Min characters');
const maxInput = () => screen.queryByLabelText('Max characters');
const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: /save question/i }));

describe('RegistrationCustomFieldForm', () => {
  it('shows the character limits of a text question', () => {
    render(
      <RegistrationCustomFieldForm
        mode="edit"
        builtInField={false}
        defaultValues={defaultValues({ min_characters: 3 })}
        onSubmit={jest.fn()}
      />
    );

    expect(minInput()).toHaveValue(3);
    expect(maxInput()).toBeInTheDocument();
  });

  it('shows the character limits of a multiline text question', () => {
    render(
      <RegistrationCustomFieldForm
        mode="edit"
        builtInField={false}
        defaultValues={defaultValues({ input_type: 'multiline_text' })}
        onSubmit={jest.fn()}
      />
    );

    expect(minInput()).toBeInTheDocument();
  });

  it('hides the character limits for other question types', () => {
    render(
      <RegistrationCustomFieldForm
        mode="edit"
        builtInField={false}
        defaultValues={defaultValues({ input_type: 'number' })}
        onSubmit={jest.fn()}
      />
    );

    expect(minInput()).not.toBeInTheDocument();
  });

  it('hides the character limits for built-in questions', () => {
    render(
      <RegistrationCustomFieldForm
        mode="edit"
        builtInField
        defaultValues={defaultValues()}
        onSubmit={jest.fn()}
      />
    );

    expect(minInput()).not.toBeInTheDocument();
  });

  it('submits a cleared minimum as null', async () => {
    const onSubmit = jest.fn();
    render(
      <RegistrationCustomFieldForm
        mode="edit"
        builtInField={false}
        defaultValues={defaultValues({ min_characters: 3 })}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText('Min characters'), {
      target: { value: '' },
    });
    submit();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ min_characters: null })
      );
    });
  });

  it('refuses a maximum that is not greater than the minimum', () => {
    render(
      <RegistrationCustomFieldForm
        mode="edit"
        builtInField={false}
        defaultValues={defaultValues({ min_characters: 5 })}
        onSubmit={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Max characters'), {
      target: { value: '5' },
    });

    expect(screen.getByLabelText('Max characters')).toBeInvalid();
  });

  it('leaves character limits out for other question types', async () => {
    const onSubmit = jest.fn();
    render(
      <RegistrationCustomFieldForm
        mode="edit"
        builtInField={false}
        defaultValues={defaultValues({
          input_type: 'number',
          min_characters: 3,
        })}
        onSubmit={onSubmit}
      />
    );

    submit();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          min_characters: undefined,
          max_characters: undefined,
        })
      );
    });
  });
});
