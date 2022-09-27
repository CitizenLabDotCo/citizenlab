import { yupResolver } from '@hookform/resolvers/yup';
import translationMessages from 'i18n/en';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { fireEvent, render, screen, waitFor } from 'utils/testUtils/rtl';
import validateMultiloc from 'utils/yup/validateMultiloc';
import { object } from 'yup';
import InputMultilocWithLocaleSwitcher from './';

const schema = object({
  title: validateMultiloc('Error message'),
});

jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <InputMultilocWithLocaleSwitcher
          name="title"
          placeholder="title"
          type="text"
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('InputMultilocWithLocaleSwitcher', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
  });
  it('submits correct data from input', async () => {
    render(<Form />);
    const valueEN = 'en title';
    const valueNL = 'nl title';

    fireEvent.change(screen.getByPlaceholderText(/title/i), {
      target: {
        value: valueEN,
      },
    });

    fireEvent.click(screen.getByText(/nl-NL/i));

    fireEvent.change(screen.getByPlaceholderText(/title/i), {
      target: {
        value: valueNL,
      },
    });

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: { en: valueEN, 'nl-NL': valueNL },
      })
    );
  });
  it('shows front-end validation error when there is one', async () => {
    render(<Form />);
    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });
  it('shows API validation error when there is one', async () => {
    const FormWithAPIError = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(() =>
              methods.setError('title', { error: 'blank' } as any)
            )}
          >
            <InputMultilocWithLocaleSwitcher
              name="title"
              label="title"
              type="text"
            />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIError />);

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(
        screen.getByText(
          (translationMessages as Record<string, string>)[
            'app.errors.generics.blank'
          ]
        )
      ).toBeInTheDocument();
    });
  });
});
