import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import FileUploader from './';
import { useForm, FormProvider } from 'react-hook-form';

jest.mock('utils/cl-intl');
jest.mock('hooks/useRemoteFiles', () => () => null);

const file = new File(['file'], 'file.pdf', {
  type: 'application/pdf',
});

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({ defaultValues: { input: [file] } });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <FileUploader name="input" resourceId="pageId" resourceType="page" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('FileUploader', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByTestId('fileInput')).toBeInTheDocument();
  });
  it('submits correct data from input', async () => {
    render(<Form />);

    await waitFor(() => {
      fireEvent.change(screen.getByTestId('fileInput'), {
        target: { files: [file] },
      });
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText(/submit/i));
    });
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ input: [file] })
    );
  });
});
