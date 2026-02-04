import React from 'react';

import { ProjectsFilterTypes } from 'api/custom_pages/types';

import {
  screen,
  render,
  fireEvent,
  waitFor,
  userEvent,
} from 'utils/testUtils/rtl';

import CustomPageSettingsForm from './';

const titleEN = 'title en';
const titleNL = 'title nl';
const editedTitleEN = 'edited title en';
const editedTitleNL = 'edited title nl';
// Slug computation takes primary title as base
const slug = 'title-en';

jest.mock('api/global_topics/useGlobalTopics');
jest.mock('api/areas/useAreas');

jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);

describe('CustomPageSettingsForm', () => {
  describe('New custom page', () => {
    const mode = 'new';
    const defaultProps = {
      onSubmit: jest.fn(),
      defaultValues: {
        title_multiloc: { en: '', 'nl-NL': '' },
        projects_filter_type: 'no_filter' as ProjectsFilterTypes,
      },
    };

    it('renders', () => {
      render(<CustomPageSettingsForm mode={mode} {...defaultProps} />);
      expect(screen.getByTestId('customPageSettingsForm')).toBeInTheDocument();
    });

    it('submits correct data', async () => {
      const { container } = render(
        <CustomPageSettingsForm mode={mode} {...defaultProps} />
      );

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
        target: {
          value: titleEN,
        },
      });

      fireEvent.click(screen.getByText(/nl-NL/i));

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
        target: {
          value: titleNL,
        },
      });

      fireEvent.click(container.querySelector('button[type="submit"]'));

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
          title_multiloc: { en: titleEN, 'nl-NL': titleNL },
          projects_filter_type: 'no_filter',
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
    const defaultProps = {
      onSubmit: jest.fn(),
      defaultValues: {
        title_multiloc: { en: titleEN, 'nl-NL': titleNL },
        projects_filter_type: 'no_filter' as ProjectsFilterTypes,
        slug,
      },
    };

    it('renders', () => {
      render(<CustomPageSettingsForm mode={mode} {...defaultProps} />);
      expect(screen.getByTestId('customPageSettingsForm')).toBeInTheDocument();
    });

    it('submits correct data', async () => {
      const { container } = render(
        <CustomPageSettingsForm mode={mode} {...defaultProps} />
      );

      // Set title field
      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
        target: {
          value: editedTitleEN,
        },
      });

      fireEvent.click(screen.getByText(/nl-NL/i));
      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
        target: {
          value: editedTitleNL,
        },
      });

      // Set slug field
      fireEvent.change(screen.getByRole('textbox', { name: 'Slug' }), {
        target: {
          value: 'new-slug',
        },
      });

      // Submit form
      fireEvent.click(container.querySelector('button[type="submit"]'));

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
          title_multiloc: { en: editedTitleEN, 'nl-NL': editedTitleNL },
          projects_filter_type: 'no_filter',
          slug: 'new-slug',
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

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
        target: {
          value: '',
        },
      });

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

      fireEvent.change(screen.getByRole('textbox', { name: 'Slug' }), {
        target: {
          // invalid slug
          value: '%%%',
        },
      });

      fireEvent.click(container.querySelector('button[type="submit"]'));
      await waitFor(() => {
        expect(screen.getAllByTestId('error-message')).toHaveLength(2);
        expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      });
    });

    it('keeps showing the slug input when field is erased', async () => {
      const user = userEvent.setup();
      render(<CustomPageSettingsForm mode={mode} {...defaultProps} />);

      const slugInput = screen.getByRole('textbox', { name: 'Slug' });
      await user.clear(slugInput);
      expect(slugInput).toBeInTheDocument();
    });
  });
});
