import React from 'react';

import { useFormContext } from 'react-hook-form';

import clHistory from 'utils/cl-router/history';
import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import QuestionPreview from './QuestionPreview';

const SENTIMENT_FIELD_KEY = 'how_do_you_feel';

jest.mock('api/custom_fields/useCustomFields', () =>
  jest.fn(() => ({
    data: [
      {
        id: 'field-1',
        key: SENTIMENT_FIELD_KEY,
        input_type: 'sentiment_linear_scale',
      },
    ],
  }))
);

// Stands in for "the user answered the first question".
jest.mock('components/CustomFieldsForm/CustomFields', () => {
  return function CustomFieldsMock() {
    const { setValue } = useFormContext();

    return (
      <button onClick={() => setValue(SENTIMENT_FIELD_KEY, 3)}>Answer</button>
    );
  };
});

const props = {
  projectSlug: 'community-monitor',
  phaseId: 'phase-1',
  projectId: 'project-1',
};

describe('QuestionPreview', () => {
  it('redirects to the full survey once the question is answered', async () => {
    render(<QuestionPreview {...props} onClose={jest.fn()} />);

    await userEvent.click(await screen.findByText('Answer'));

    await waitFor(() => {
      expect(clHistory.push).toHaveBeenCalledWith(
        '/projects/community-monitor/surveys/new?phase_id=phase-1&go_back=true'
      );
    });
  });

  it('only redirects once, even when the parent re-renders with a new onClose', async () => {
    // Duplicate entries on the history stack are what left users unable to
    // leave the form: 'go back' moved them to the previous copy of this page.
    const { rerender } = render(
      <QuestionPreview {...props} onClose={jest.fn()} />
    );

    await userEvent.click(await screen.findByText('Answer'));

    await waitFor(() => {
      expect(clHistory.push).toHaveBeenCalledTimes(1);
    });

    rerender(<QuestionPreview {...props} onClose={jest.fn()} />);
    rerender(<QuestionPreview {...props} onClose={jest.fn()} />);

    expect(clHistory.push).toHaveBeenCalledTimes(1);
  });
});
