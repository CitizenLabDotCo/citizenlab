import React from 'react';
import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';
import TopicForm from './';

const titleEN = 'en title';
const titleNL = 'nl title';

const defaultProps = {
  onSubmit: jest.fn(),
  defaultValues: {
    title_multiloc: { en: '', 'nl-NL': '' },
  },
};

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);

describe('TopicForm', () => {
  it('renders', () => {
    render(<TopicForm {...defaultProps} />);
    expect(screen.getByTestId('topicForm')).toBeInTheDocument();
  });
  it('submits correct data', async () => {
    const { container } = render(<TopicForm {...defaultProps} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: titleEN,
      },
    });

    fireEvent.click(screen.getByText(/nl-NL/i));

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: titleNL,
      },
    });

    fireEvent.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title_multiloc: { en: titleEN, 'nl-NL': titleNL },
      });
      expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument();
    });
  });
  it('shows error summary and error message when title is missing', async () => {
    const { container } = render(<TopicForm {...defaultProps} />);
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(screen.getAllByTestId('error-message')).toHaveLength(2);
      expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });
});
