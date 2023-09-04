import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import RadioGroup from './';
import Radio from './Radio';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = object({
  radio: string().required('Error message'),
});

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <RadioGroup name="radio">
          <Radio value={'1'} name="radio" id={`radio-1`} label={'1'} />
          <Radio value={'2'} name="radio" id={`radio-2`} label={'2'} />
        </RadioGroup>
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('Radio', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByLabelText(/1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/2/i)).toBeInTheDocument();
  });
  it('submits correct data from radio', async () => {
    render(<Form />);
    const value = '1';

    fireEvent.click(screen.getByLabelText(/1/i));
    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ radio: value })
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
              methods.setError('radio', { error: 'blank' } as any)
            )}
          >
            <RadioGroup name="radio">
              <Radio value={'1'} name="radio" id={`radio-1`} label={'1'} />
              <Radio value={'2'} name="radio" id={`radio-2`} label={'2'} />
            </RadioGroup>
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
