import React from 'react';
import { screen, render, userEvent } from 'utils/testUtils/rtl';
import InitiativeForm, { Props } from '.';

// Needed for language selector of org name multiloc input
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));
jest.mock('api/topics/useTopics');
jest.mock('api/app_configuration/useAppConfiguration');

const submitButtonName = 'Publish your initiative';

describe('InitiativeForm', () => {
  it('shows the error summary and error messages', async () => {
    const props: Props = {
      onSubmit: jest.fn(),
    };
    render(<InitiativeForm {...props} />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: submitButtonName });
    await user.click(submitButton);

    // Title and body multiloc need 1 locale, topic has to be present, other fields optional for now + 1 common
    expect(screen.getAllByTestId('error-message')).toHaveLength(4);
    expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });
});
