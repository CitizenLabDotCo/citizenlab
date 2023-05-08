import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import PasswordInput from './';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = object({
  password: string().min(8, 'Too short'),
});

jest.mock('api/app_configuration/useAppConfiguration', () => () => ({
  data: {
    data: {
      attributes: {
        settings: { password_login: { minimum_length: 8 }, core: {} },
      },
    },
  },
}));

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <label htmlFor="password">password</label>
        <PasswordInput name="password" placeholder="password" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('PasswordInput', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
  it('submits correct data from input', async () => {
    render(<Form />);
    const value = 'some password';

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: {
        value,
      },
    });

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ password: value })
    );
  });
  it('shows front-end validation error when there is one', async () => {
    render(<Form />);

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: {
        value: 'short',
      },
    });

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Too short')).toBeInTheDocument();
    });
  });
  it('shows API validation error when there is one', async () => {
    const FormWithAPIError = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(() =>
              methods.setError('password', { error: 'invalid' } as any)
            )}
          >
            <label htmlFor="password">password</label>
            <PasswordInput name="password" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIError />);

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(
        screen.getByText('This field contains an invalid value.')
      ).toBeInTheDocument();
    });
  });
});
