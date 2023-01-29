import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import TextArea from './';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = object({
  input: string().required('Error message'),
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
        <TextArea name="input" placeholder="input" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('TextArea', () => {
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
            <TextArea name="slug" placeholder="slug" />
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
