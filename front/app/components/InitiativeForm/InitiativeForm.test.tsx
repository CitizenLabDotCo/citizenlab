import React from 'react';
import { screen, render, userEvent, waitFor } from 'utils/testUtils/rtl';
import InitiativeForm, { Props } from '.';
import { initiativeData } from 'api/initiatives/__mocks__/useInitiatives';
const defaultProps: Props = {
  onSubmit: jest.fn(),
  initiative: initiativeData,
};

// Needed for language selector of org name multiloc input
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));
jest.mock('api/topics/useTopics');
``;
const submitButtonName = 'Publish your initiative';

describe('InitiativeForm', () => {
  it('Changes fields and submits form correctly', async () => {
    const { container } = render(<InitiativeForm {...defaultProps} />);
    const user = userEvent.setup();

    // Fill out title
    const titleInputMultiloc = container.querySelector('#title_multiloc');
    const title = 'Initiative title';
    user.clear(titleInputMultiloc);
    await user.type(titleInputMultiloc, title);

    // Fill out body
    // id of the Quill editor in this, looked up via dev console
    const bodyQuillEditorMultiloc =
      container.querySelector('#body_multiloc-en');
    const body = 'Initiative body that is at least 30 characters long';
    user.clear(bodyQuillEditorMultiloc);
    await user.type(bodyQuillEditorMultiloc, body);

    const submitButton = screen.getByRole('button', {
      name: submitButtonName,
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title_multiloc: { en: title },
        // Quill (or our implementation of it) adds this HTML
        body_multiloc: { en: `<p><br></p><p>${body}</p>` },
        cosponsor_ids: [],
        topic_ids: [initiativeData.relationships.topics.data[0].id],
        local_initiative_files: [],
        images: [],
        header_bg: [],
        anonymous: initiativeData.attributes.anonymous,
        position: initiativeData.attributes.location_description,
      });
      expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument();
    });
  });

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
