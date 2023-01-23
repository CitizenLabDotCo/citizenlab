import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import ImageDropzone from './';
import { useForm, FormProvider } from 'react-hook-form';

jest.mock('utils/cl-intl');

const file = new File(['file'], 'file.png', {
  type: 'image/png',
});

const onSubmit = jest.fn();

const Form = ({ defaultValues }) => {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <ImageDropzone name="input" imagePreviewRatio={1} inputLabel="input" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('ImageDropzone', () => {
  it('renders', () => {
    render(<Form defaultValues={{}} />);
    expect(screen.getByLabelText('input')).toBeInTheDocument();
  });
  it('submits correct data from input', async () => {
    render(<Form defaultValues={{ input: [file] }} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText(/submit/i));
    });
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ input: [file] })
    );
  });
});
