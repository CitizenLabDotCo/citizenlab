import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import RHFFeedback from './';
import RHFInput from '../RHFInput';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import translationMessages from 'i18n/en';
import { handleRHFSubmissionError } from 'utils/errorUtils';

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
        <RHFFeedback />
        <RHFInput name="input" type="text" placeholder="input" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('RHFFeedback', () => {
  it('does not render initially', () => {
    render(<Form />);
    expect(screen.queryByTestId('feedback')).not.toBeInTheDocument();
  });
  it('renders success message', async () => {
    render(<Form />);

    const value = 'some input';
    fireEvent.change(screen.getByPlaceholderText(/input/i), {
      target: {
        value,
      },
    });

    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() =>
      expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument()
    );
  });
  it('shows front-end validation error message', async () => {
    render(<Form />);
    fireEvent.click(screen.getByText(/submit/i));
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getAllByText('Error message')).toHaveLength(2);
    });
  });
  it('shows API validation error message linked to a field', async () => {
    const FormWithAPIFieldError = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(() =>
              methods.setError('slug', { error: 'taken' } as any)
            )}
          >
            <RHFFeedback />
            <RHFInput name="slug" type="text" placeholder="slug" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIFieldError />);

    const value = 'slug';
    fireEvent.change(screen.getByPlaceholderText(/slug/i), {
      target: {
        value,
      },
    });

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(
        screen.queryByText(
          (translationMessages as Record<string, string>)[
            'app.errors.slug_taken'
          ]
        )
      ).toBeInTheDocument();
    });
  });
  it('shows API validation error message not linked to a field', async () => {
    const FormWithAPIError = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(() => {
              handleRHFSubmissionError(new Error(), methods.setError);
            })}
          >
            <RHFFeedback />
            <RHFInput name="input" type="text" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIError />);

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(screen.getByTestId('feedbackSubmissionError')).toBeInTheDocument();
    });
  });
});
