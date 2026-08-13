import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import PhoneInput from './';

let mockAllowedCountryCodes: string[] | undefined;

jest.mock('api/app_configuration/useAppConfiguration', () =>
  jest.fn(() => ({
    data: {
      data: {
        attributes: {
          settings: {
            core: { country_code: 'BE' },
            sms: { allowed_country_codes: mockAllowedCountryCodes },
          },
        },
      },
    },
  }))
);

const schema = object({
  phone: string().required('Required'),
});

const onSubmit = jest.fn();

const Form = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { phone: '' },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((data) => onSubmit(data))}>
        <PhoneInput name="phone" placeholder="phone" />
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
  beforeEach(() => {
    onSubmit.mockClear();
    mockAllowedCountryCodes = undefined;
  });

  it('renders the phone input', () => {
    render(<Form />);
    expect(screen.getByPlaceholderText('phone')).toBeInTheDocument();
  });

  it('limits the country dropdown to the countries the platform allows', () => {
    mockAllowedCountryCodes = ['BE', 'FR'];
    render(<Form />);
    openCountryDropdown();

    const countries = screen
      .getAllByRole('option')
      .map((option) => option.getAttribute('data-iso2'));

    // The allow-list is uppercase, but intl-tel-input only recognises lowercase
    // codes, so this also covers the conversion.
    expect(countries).toEqual(expect.arrayContaining(['be', 'fr']));
    expect(countries).not.toContain('us');
  });

  it('offers every country when the platform configures no allow-list', () => {
    render(<Form />);
    openCountryDropdown();

    const countries = screen
      .getAllByRole('option')
      .map((option) => option.getAttribute('data-iso2'));

    expect(countries).toEqual(expect.arrayContaining(['be', 'fr', 'us']));
  });

  it("shows the platform country's calling code as a prefix", () => {
    const { container } = render(<Form />);

    // The calling code sits next to the flag rather than inside the input, so the
    // user only has to type their local number.
    expect(
      container.querySelector('.iti__selected-dial-code')
    ).toHaveTextContent('+32');
  });

  it('submits the composed E.164 number', async () => {
    render(<Form />);

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
