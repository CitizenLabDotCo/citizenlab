import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import Toggle from './';
import { useForm, FormProvider } from 'react-hook-form';
import { boolean, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = object({
  toggle: boolean().oneOf([true], 'Error message'),
});

jest.mock('utils/cl-intl');

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <Toggle name="toggle" label="toggle" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('Toggle', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByText(/toggle/i)).toBeInTheDocument();
  });
  it('submits correct data from Toggle', async () => {
    render(<Form />);

    fireEvent.click(screen.getByText(/toggle/i));

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ toggle: true })
    );
  });
  it('shows front-end validation error when there is one', async () => {
    render(<Form />);
    fireEvent.click(screen.getByText(/submit/i));
    expect(onSubmit).not.toHaveBeenCalled();
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
              methods.setError('toggle', { error: 'invalid' } as any)
            )}
          >
            <Toggle name="toggle" label="toggle" />
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
