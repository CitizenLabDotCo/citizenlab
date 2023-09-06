import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import MultiSelect from '.';
import { useForm, FormProvider } from 'react-hook-form';
import { array, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import selectEvent from 'react-select-event';

const schema = object({
  multiSelect: array().required('Error message'),
});

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <MultiSelect
          name="multiSelect"
          options={[
            { label: '1', value: '1' },
            { label: '2', value: '2' },
          ]}
          label="multiSelect"
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('MultiSelect', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByLabelText(/multiSelect/i)).toBeInTheDocument();
  });
  it('submits correct data from MultiSelect', async () => {
    render(<Form />);

    selectEvent.openMenu(screen.getByLabelText(/multiSelect/i));
    fireEvent.click(screen.getByText('1'));
    selectEvent.openMenu(screen.getByLabelText(/multiSelect/i));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ multiSelect: ['1', '2'] })
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
              methods.setError('MultiSelect', { error: 'blank' } as any)
            )}
          >
            <MultiSelect name="MultiSelect" label="MultiSelect" options={[]} />
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
