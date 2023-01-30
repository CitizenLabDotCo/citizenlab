import React from 'react';
import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';
import CauseForm from './CauseForm';

const titleEN = 'en title';
const titleNL = 'nl title';

const descriptionEN = 'en description';
const descriptionNL = 'nl description';

const defaultProps = {
  onSubmit: jest.fn(),
  defaultValues: {
    title_multiloc: { en: '', 'nl-NL': '' },
    description_multiloc: { en: descriptionEN, 'nl-NL': descriptionNL },
  },
};

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);

describe('CauseForm', () => {
  it('renders', () => {
    render(<CauseForm {...defaultProps} />);
    expect(screen.getByTestId('causeForm')).toBeInTheDocument();
  });
  it('submits correct data', async () => {
    const { container } = render(<CauseForm {...defaultProps} />);

    fireEvent.change(container.querySelector('#title_multiloc'), {
      target: {
        value: titleEN,
      },
    });

    fireEvent.click(screen.getAllByText(/nl-NL/i)[0]);

    fireEvent.change(container.querySelector('#title_multiloc'), {
      target: {
        value: titleNL,
      },
    });

    fireEvent.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title_multiloc: { en: titleEN, 'nl-NL': titleNL },
        description_multiloc: { en: descriptionEN, 'nl-NL': descriptionNL },
        image: null,
      });
      expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument();
    });
  });
  it('shows error summary and error message when title is missing', async () => {
    const { container } = render(<CauseForm {...defaultProps} />);
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(screen.getAllByTestId('error-message')).toHaveLength(2);
      expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });
});
