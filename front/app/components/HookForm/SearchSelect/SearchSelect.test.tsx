import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import selectEvent from 'react-select-event';
import { object, string } from 'yup';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import SearchSelect from '.';

const schema = object({
  select: string().required('Error message'),
});

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <SearchSelect
          name="select"
          label="select"
          options={[
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
          ]}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('SearchSelect', () => {
  beforeEach(() => onSubmit.mockReset());

  it('renders', () => {
    render(<Form />);
    expect(screen.getByLabelText(/select/i)).toBeInTheDocument();
  });

  it('submits the selected value', async () => {
    render(<Form />);

    await selectEvent.select(screen.getByLabelText(/select/i), 'Option 2');
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ select: '2' }));
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
              methods.setError('select', { error: 'blank' } as any)
            )}
          >
            <SearchSelect name="select" label="select" options={[]} />
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
