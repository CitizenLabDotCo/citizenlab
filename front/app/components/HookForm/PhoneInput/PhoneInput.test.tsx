import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from 'utils/testUtils/rtl';

import PhoneInput from './';

const schema = object({
  phone: string().required('Required'),
});

const onSubmit = jest.fn();

const Form = ({
  countries,
  defaultCountry,
}: {
  countries?: string[];
  defaultCountry?: string;
}) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { phone: '' },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((data) => onSubmit(data))}>
        <PhoneInput
          name="phone"
          countries={countries}
          defaultCountry={defaultCountry}
          placeholder="phone"
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('PhoneInput (HookForm)', () => {
  beforeEach(() => onSubmit.mockClear());

  it('renders the phone input', () => {
    render(<Form />);
    expect(screen.getByPlaceholderText('phone')).toBeInTheDocument();
  });

  it('limits the country dropdown to the allowed countries', () => {
    render(<Form countries={['BE', 'FR']} />);

    const countrySelect = screen.getByRole('combobox');
    const values = within(countrySelect)
      .getAllByRole('option')
      .map((option) => (option as HTMLOptionElement).value);

    expect(values).toEqual(expect.arrayContaining(['BE', 'FR']));
    expect(values).not.toContain('US');
  });

  it('shows the country calling code as a prefix for the selected country', () => {
    render(<Form countries={['BE']} defaultCountry="BE" />);

    // With a default country the input is pre-filled with its calling code,
    // signalling that the user only needs to type their local number.
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toContain(
      '+32'
    );
  });

  it('submits the composed E.164 number', async () => {
    render(<Form countries={['BE']} defaultCountry="BE" />);

    // The calling-code prefix stays fixed; the user types their local number
    // after it, producing the full international value.
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '+32 470 12 34 56' },
    });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ phone: '+32470123456' })
    );
  });
});
