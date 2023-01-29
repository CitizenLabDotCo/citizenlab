import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import Select from './';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = object({
  select: string().required('Error message'),
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
        <Select
          name="select"
          options={[
            { label: '1', value: '1' },
            { label: '2', value: '2' },
          ]}
          label="select"
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('Select', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByLabelText(/select/i)).toBeInTheDocument();
  });
  it('submits correct data from select', async () => {
    render(<Form />);
    const value = '1';

    fireEvent.change(screen.getByLabelText(/select/i), {
      target: {
        value,
      },
    });

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ select: value })
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
              methods.setError('select', { error: 'blank' } as any)
            )}
          >
            <Select name="select" label="select" options={[]} />
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
