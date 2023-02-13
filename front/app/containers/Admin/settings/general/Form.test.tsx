import React from 'react';
import { screen, render, userEvent } from 'utils/testUtils/rtl';
import Form from './Form';

const titleEN = 'en title';
const titleNL = 'nl title';

const defaultProps = {
  onSubmit: jest.fn(),
  defaultValues: {
    organization_name: { en: 'My city', 'nl-NL': 'Mijn stad' },
    locales: ['en' as const, 'nl-NL' as const],
    organization_site: 'https://mywebsite.com',
  },
};

describe('Form', () => {
  it('submits correct data', async () => {
    const { container } = render(<Form {...defaultProps} />);
    const user = userEvent.setup();

    user.type(screen.getByRole('textbox'), titleEN);
    user.click(screen.getByText(/nl-NL/i));
    user.type(screen.getByRole('textbox'), titleNL);
    await user.click(container.querySelector('button[type="submit"]'));

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      nav_bar_item_title_multiloc: { en: titleEN, 'nl-NL': titleNL },
    });
    expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument();
  });
});
