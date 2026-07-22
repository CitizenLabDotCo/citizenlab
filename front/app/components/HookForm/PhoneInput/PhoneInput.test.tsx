import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

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

// The country dropdown is a button + listbox, and only renders its options once
// opened. Its label reads "Select"/"Change country..." depending on whether a
// country is already selected.
const openCountryDropdown = () =>
  fireEvent.click(
    screen.getByRole('button', { name: /country for phone number/i })
  );

describe('PhoneInput (HookForm)', () => {
  beforeEach(() => onSubmit.mockClear());

  it('renders the phone input', () => {
    render(<Form />);
    expect(screen.getByPlaceholderText('phone')).toBeInTheDocument();
  });

  it('limits the country dropdown to the allowed countries', () => {
    render(<Form countries={['BE', 'FR']} />);
    openCountryDropdown();

    const countries = screen
      .getAllByRole('option')
      .map((option) => option.getAttribute('data-iso2'));

    // The allow-list is uppercase, but intl-tel-input only recognises lowercase
    // codes, so this also covers the conversion.
    expect(countries).toEqual(expect.arrayContaining(['be', 'fr']));
    expect(countries).not.toContain('us');
  });

  it('shows the country calling code as a prefix for the selected country', () => {
    const { container } = render(
      <Form countries={['BE']} defaultCountry="BE" />
    );

    // The calling code sits next to the flag rather than inside the input, so the
    // user only has to type their local number.
    expect(
      container.querySelector('.iti__selected-dial-code')
    ).toHaveTextContent('+32');
  });

  it('submits the composed E.164 number', async () => {
    render(<Form countries={['BE']} defaultCountry="BE" />);

    // Only the local number is typed; the calling code of the selected country is
    // prepended to produce the full international value.
    const input = screen.getByPlaceholderText('phone');
    await userEvent.type(input, '470123456');

    // The number is only composed once the phone number metadata has loaded
    // asynchronously, which the as-you-type formatting tells us has happened.
    await waitFor(() => expect(input).toHaveValue('470 12 34 56'));

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ phone: '+32470123456' })
    );
  });
});
