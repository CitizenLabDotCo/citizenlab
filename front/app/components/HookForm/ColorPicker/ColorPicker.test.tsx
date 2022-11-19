import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import ColorPicker from './';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = object({
  color: string().required('Error message'),
});

jest.mock('utils/cl-intl');

const onSubmit = jest.fn();

const defaultFormValues = {
  color: '',
};

const Form = ({
  defaultValues,
}: {
  defaultValues?: typeof defaultFormValues;
}) => {
  const methods = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <ColorPicker name="color" label="color" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('ColorPicker', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  it('submits correct data from color', async () => {
    const value = '#000000';
    render(<Form defaultValues={{ color: value }} />);

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ color: value })
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
            <ColorPicker name="slug" label="slug" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIError />);

    const value = 'slug';
    fireEvent.change(screen.getByRole('textbox'), {
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
