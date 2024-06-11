import React from 'react';

import { screen, render, userEvent } from 'utils/testUtils/rtl';

import Form, { Props } from './Form';

const orgNameEN = 'EN org name';
const orgNameNL = 'NL org name';
const defaultProps: Props = {
  onSubmit: jest.fn(),
  defaultValues: {
    organization_name: { en: orgNameEN, 'nl-NL': orgNameNL },
    locales: ['en' as const, 'nl-NL' as const],
    organization_site: 'https://mywebsite.com',
    population: 12500,
  },
};

// Needed for language selector of org name multiloc input
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);

describe('Form', () => {
  it('Submits changes correctly', async () => {
    render(<Form {...defaultProps} />);
    const user = userEvent.setup();
    const orgNameInputField = screen.getByLabelText(
      'Name of city or organization'
    );

    await user.click(screen.getByRole('button', { name: 'nl-NL' }));
    await user.clear(orgNameInputField);
    const newOrgNameNl = 'Mijn stad';
    await user.type(orgNameInputField, newOrgNameNl);
    const submitButton = screen.getByRole('button', { name: 'Save' });
    await user.click(submitButton);

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      locales: ['en', 'nl-NL'],
      organization_name: { en: orgNameEN, 'nl-NL': newOrgNameNl },
      organization_site: 'https://mywebsite.com',
      population: 12500,
    });
    expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument();
  });

  it('shows the error summary and error messages', async () => {
    const props: Props = {
      onSubmit: jest.fn(),
      defaultValues: {
        organization_name: { en: '', 'nl-NL': '' },
        locales: [],
        organization_site: 'invalid URL',
        population: -5,
      },
    };
    render(<Form {...props} />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: 'Save' });
    await user.click(submitButton);

    expect(screen.getAllByTestId('error-message')).toHaveLength(5);
    expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });
});
