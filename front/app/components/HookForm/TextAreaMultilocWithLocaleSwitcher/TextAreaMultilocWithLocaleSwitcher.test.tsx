import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { object } from 'yup';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import TextAreaMultilocWithLocaleSwitcher from './';

const schema = object({
  title: validateMultilocForEveryLocale('Error message'),
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
        <TextAreaMultilocWithLocaleSwitcher name="title" label="title" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('TextAreaMultilocWithLocaleSwitcher', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });
  it('submits correct data from TextArea', async () => {
    render(<Form />);
    const valueEN = 'en title';
    const valueNL = 'nl title';

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: {
        value: valueEN,
      },
    });

    fireEvent.click(screen.getByText(/nl-NL/i));

    fireEvent.change(screen.getByLabelText(/title/i), {
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
            <TextAreaMultilocWithLocaleSwitcher name="title" label="title" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIError />);

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(
        screen.getByText('This field cannot be empty.')
      ).toBeInTheDocument();
    });
  });
});
