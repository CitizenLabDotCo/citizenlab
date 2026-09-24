import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import CheckboxMultiSelect from '.';

const onSubmit = jest.fn();

const Form = ({ disabled }: { disabled?: boolean }) => {
  const methods = useForm({ defaultValues: { multiSelect: ['1'] } });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <CheckboxMultiSelect
          name="multiSelect"
          title="multiSelect"
          options={[
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
          ]}
          disabled={disabled}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('CheckboxMultiSelect', () => {
  beforeEach(() => onSubmit.mockClear());

  it('toggles options', async () => {
    render(<Form />);

    fireEvent.click(screen.getAllByTestId('check-mark-background')[0]);
    fireEvent.click(screen.getAllByTestId('check-mark-background')[1]);
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ multiSelect: ['2'] })
    );
  });

  it('does not change the value when disabled', async () => {
    render(<Form disabled />);

    screen
      .getAllByRole('checkbox')
      .forEach((checkbox) => expect(checkbox).toBeDisabled());

    fireEvent.click(screen.getAllByTestId('check-mark-background')[0]);
    fireEvent.click(screen.getAllByTestId('check-mark-background')[1]);
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ multiSelect: ['1'] })
    );
  });
});
