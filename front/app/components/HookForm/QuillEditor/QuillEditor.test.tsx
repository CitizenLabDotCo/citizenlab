import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import QuillEditor from './';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = object({
  input: string().required('Error message'),
});

const onSubmit = jest.fn();

const Form = ({ defaultValue }: { defaultValue?: string }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { input: defaultValue },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <QuillEditor name="input" placeholder="input" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('QuillEditor', () => {
  it('renders', () => {
    const { container } = render(<Form />);
    expect(container.querySelector('.ql-editor')).toBeInTheDocument();
  });
  it('submits correct data from input', async () => {
    const value = 'some input';
    render(<Form defaultValue={value} />);

    fireEvent.click(screen.getByText(/submit/i));

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ input: value })
    );

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        input: value,
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
              methods.setError('slug', { error: 'taken' } as any)
            )}
          >
            <QuillEditor name="slug" placeholder="slug" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIError />);

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
