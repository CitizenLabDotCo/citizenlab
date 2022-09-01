import React from 'react';
import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';
import CustomPageSettingsForm from './';

const titleEN = 'title en';
const titleNL = 'title nl';
// Slug computation takes primary title as base
const slug = 'title-en';

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

describe('CustomPageSettingsForm', () => {
  describe('New custom page', () => {
    const mode = 'new';

    it('renders', () => {
      render(<CustomPageSettingsForm mode={mode} {...defaultProps} />);
      expect(screen.getByTestId('customPageSettingsForm')).toBeInTheDocument();
    });

    it('submits correct data', async () => {
      const { container } = render(
        <CustomPageSettingsForm mode={mode} {...defaultProps} />
      );

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
        expect(
          screen.getByTestId('feedbackSuccessMessage')
        ).toBeInTheDocument();
      });
    });

    it('shows error summary and error message when title is missing', async () => {
      const { container } = render(
        <CustomPageSettingsForm mode={mode} {...defaultProps} />
      );

      fireEvent.click(container.querySelector('button[type="submit"]'));
      await waitFor(() => {
        expect(screen.getAllByTestId('error-message')).toHaveLength(2);
        expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit custom page', () => {
    const mode = 'edit';

    it('renders', () => {
      render(<CustomPageSettingsForm mode={mode} {...defaultProps} />);
      expect(screen.getByTestId('customPageSettingsForm')).toBeInTheDocument();
    });

    it('submits correct data', async () => {
      const { container } = render(
        <CustomPageSettingsForm mode={mode} {...defaultProps} />
      );

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
          slug,
        });
        expect(
          screen.getByTestId('feedbackSuccessMessage')
        ).toBeInTheDocument();
      });
    });

    it('shows error summary and error message when title is missing', async () => {
      const { container } = render(
        <CustomPageSettingsForm mode={mode} {...defaultProps} />
      );

      fireEvent.click(container.querySelector('button[type="submit"]'));
      await waitFor(() => {
        expect(screen.getAllByTestId('error-message')).toHaveLength(2);
        expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      });
    });

    it('shows error summary and error message when slug is not correct', async () => {
      const { container } = render(
        <CustomPageSettingsForm mode={mode} {...defaultProps} />
      );

      fireEvent.click(container.querySelector('button[type="submit"]'));
      await waitFor(() => {
        expect(screen.getAllByTestId('error-message')).toHaveLength(2);
        expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      });
    });
  });
});
