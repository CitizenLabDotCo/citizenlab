import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import QuillMultilocWithLocaleSwitcher from './';
import { useForm, FormProvider } from 'react-hook-form';
import { object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

const schema = object({
  description: validateMultilocForEveryLocale('Error message'),
});

jest.mock('utils/cl-intl');
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);
jest.mock('hooks/useLocale');

const onSubmit = jest.fn();

const Form = ({ defaultValue }: { defaultValue?: Record<string, string> }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { description: defaultValue },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <QuillMultilocWithLocaleSwitcher name="description" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('QuillMultilocWithLocaleSwitcher', () => {
  it('renders', () => {
    const { container } = render(<Form />);
    expect(container.querySelector('.ql-editor')).toBeInTheDocument();
  });
  it('submits correct data from input', async () => {
    const defaultValue = { en: 'en description', 'nl-NL': 'nl description' };
    render(<Form defaultValue={defaultValue} />);

    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        description: defaultValue,
      })
    );
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
              methods.setError('title', { error: 'blank' } as any)
            )}
          >
            <QuillMultilocWithLocaleSwitcher name="title" />
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
