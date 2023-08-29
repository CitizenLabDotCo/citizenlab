import React from 'react';
import { screen, render, userEvent } from 'utils/testUtils/rtl';
import InitiativeForm, { InitiativeFormProps as Props } from '.';
import { FormValues } from '.';

const defaultProps: Props = {
  onSubmit: jest.fn(),
  defaultValues: {
    title_multiloc: {
      en: 'Initiative title',
    },
    body_multiloc: {
      en: 'Initiative body',
    },
  },
};

// Needed for language selector of org name multiloc input
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));
jest.mock('hooks/useLocale');
jest.mock('api/topics/useTopics');

const submitButtonName = 'Publish your initiative';

describe('InitiativeForm', () => {
  it('Submits changes correctly', async () => {
    const { container } = render(<InitiativeForm {...defaultProps} />);
    const user = userEvent.setup();
    const titleInputMultiloc = container.querySelector(
      '#e2e-initiative-title-input'
    );

    // await user.click(screen.getByRole('button', { name: 'nl-NL' }));
    await user.clear(titleInputMultiloc);
    const newTitle = 'New initiative title';
    await user.type(titleInputMultiloc, newTitle);
    const submitButton = screen.getByRole('button', {
      name: submitButtonName,
    });
    await user.click(submitButton);

    const formValues: FormValues = {
      title_multiloc: { en: newTitle },
      body_multiloc: { en: 'Initiative body' },
      local_initiative_files: [],
      images: [],
      header_bg: [],
    };
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(formValues);
    expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument();
  });

  it('shows the error summary and error messages', async () => {
    const props: Props = {
      onSubmit: jest.fn(),
    };
    render(<InitiativeForm {...props} />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: submitButtonName });
    await user.click(submitButton);

    // Title and body multiloc need 1 locale, other fields optional for now + 1
    expect(screen.getAllByTestId('error-message')).toHaveLength(3);
    expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });
});
