import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { LIST_LAYOUT_MAX_OPTIONS } from 'components/CustomFieldsForm/constants';

import { render, screen } from 'utils/testUtils/rtl';

import OptionsSettings from '.';

const renderSettings = (optionCount: number) => {
  const Wrapper = () => {
    const methods = useForm({
      defaultValues: {
        options: Array.from({ length: optionCount }, (_, index) => ({
          id: `option-${index}`,
        })),
        random_option_ordering: false,
        dropdown_layout: false,
      },
    });

    return (
      <FormProvider {...methods}>
        <OptionsSettings
          inputType="select"
          randomizeName="random_option_ordering"
          dropdownLayoutName="dropdown_layout"
          selectOptionsName="options"
        />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

const dropdownToggle = () =>
  screen.getByRole('checkbox', { name: /display as dropdown/i });

describe('OptionsSettings', () => {
  it('leaves the dropdown layout up to the admin for a short option list', () => {
    renderSettings(LIST_LAYOUT_MAX_OPTIONS);

    expect(dropdownToggle()).not.toBeDisabled();
    expect(dropdownToggle()).not.toBeChecked();
  });

  // Above the threshold the question renders as a dropdown whatever the stored
  // value says, so the toggle has to report that rather than the stored value.
  it('locks the dropdown layout on once the option list is too long', () => {
    renderSettings(LIST_LAYOUT_MAX_OPTIONS + 1);

    expect(dropdownToggle()).toBeDisabled();
    expect(dropdownToggle()).toBeChecked();
  });

  it('explains why the setting is locked', () => {
    renderSettings(LIST_LAYOUT_MAX_OPTIONS + 1);

    expect(
      screen.getByText(
        new RegExp(`more than ${LIST_LAYOUT_MAX_OPTIONS} options`, 'i')
      )
    ).toBeInTheDocument();
  });

  it('shows no explanation while the admin still controls the setting', () => {
    renderSettings(LIST_LAYOUT_MAX_OPTIONS);

    expect(
      screen.queryByText(
        new RegExp(`more than ${LIST_LAYOUT_MAX_OPTIONS} options`, 'i')
      )
    ).not.toBeInTheDocument();
  });
});
