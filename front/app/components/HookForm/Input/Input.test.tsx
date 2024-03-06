import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import RHFInput from './';

const schema = object({
  input: string().required('Error message'),
});

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <RHFInput name="input" type="text" placeholder="input" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('RHFInput', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByPlaceholderText(/input/i)).toBeInTheDocument();
  });
  it('submits correct data from input', async () => {
    render(<Form />);
    const value = 'some input';

    fireEvent.change(screen.getByPlaceholderText(/input/i), {
      target: {
        value,
      },
    });

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ input: value })
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
              methods.setError('slug', { error: 'taken' } as any)
            )}
          >
            <RHFInput name="slug" type="text" placeholder="slug" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIError />);

    const value = 'slug';
    fireEvent.change(screen.getByPlaceholderText(/slug/i), {
      target: {
        value,
      },
    });

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(
        screen.getByText(
          'This URL already exists. Please change the slug to something else.'
        )
      ).toBeInTheDocument();
    });
  });
});
