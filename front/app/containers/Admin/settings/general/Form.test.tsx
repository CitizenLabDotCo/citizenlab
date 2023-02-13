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
  },
};

// Needed for language selector of org name multiloc input
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);

describe('Form', () => {
  it('Submits changes correctly', async () => {
    const { container } = render(<Form {...defaultProps} />);
    const user = userEvent.setup();
    const orgNameInputField = screen.getByLabelText(
      'Name of city or organization'
    );

    await user.click(screen.getByRole('button', { name: 'nl-NL' }));
    await user.clear(orgNameInputField);
    const newOrgNameNl = 'Mijn stad';
    await user.type(orgNameInputField, newOrgNameNl);
    await user.click(container.querySelector('button[type="submit"]'));

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      locales: ['en', 'nl-NL'],
      organization_name: { en: orgNameEN, 'nl-NL': newOrgNameNl },
      organization_site: 'https://mywebsite.com',
    });
    expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument();
  });
});
