import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ProjectFilter from './index';

// Mock the API hooks
jest.mock('api/me/useAuthUser', () =>
  jest.fn(() => ({
    data: {
      data: {
        id: 'user-1',
        attributes: {
          roles: [{ type: 'admin' }],
        },
      },
    },
  }))
);

jest.mock('api/projects/useProjects', () =>
  jest.fn(() => ({
    data: {
      data: [
        {
          id: 'project-1',
          attributes: {
            title_multiloc: { en: 'Test Project 1' },
          },
        },
        {
          id: 'project-2',
          attributes: {
            title_multiloc: { en: 'Test Project 2' },
          },
        },
      ],
    },
  }))
);

// Mock the useIntl hook
jest.mock('utils/cl-intl', () => ({
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) =>
      message.defaultMessage,
  }),
}));

// Mock the useLocalize hook
jest.mock('hooks/useLocalize', () =>
  jest.fn(() => (multiloc: { en: string }) => multiloc.en)
);

describe('<ProjectFilter />', () => {
  const mockOnProjectFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the project selection field', () => {
    render(
      <ProjectFilter
        onProjectFilter={mockOnProjectFilter}
        placeholder="Select Project"
      />
    );

    expect(screen.getByText('Select Project')).toBeInTheDocument();
  });

  it('displays the currently selected project', () => {
    render(
      <ProjectFilter
        selectedProjectId="project-2"
        onProjectFilter={mockOnProjectFilter}
        placeholder="Select Project"
      />
    );

    // Should show the selected project
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('renders without crashing when no project is selected', () => {
    render(
      <ProjectFilter
        onProjectFilter={mockOnProjectFilter}
        placeholder="Select Project"
      />
    );

    expect(screen.getByText('Select Project')).toBeInTheDocument();
  });
});
