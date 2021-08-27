import React from 'react';
import { render, screen, fireEvent, userEvent } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsViews';

jest.mock('modules/commercial/insights/services/insightsViews', () => ({
  addInsightsView: jest.fn(),
}));

jest.mock('utils/cl-intl');
jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('resources/GetProjects', () => {});
jest.mock('hooks/useLocale');
jest.mock('hooks/useLocalize');

import { CreateInsightsView } from './CreateInsightsView';
import { GetProjectsChildProps } from 'resources/GetProjects';

const closeModal = jest.fn();

const project2Id = '4b429681-1744-456f-8550-e89a2c2c74b2';

const mockProjectsData = {
  projectsList: [
    {
      id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
      type: 'project',
      attributes: {
        ideas_count: 5,
        title_multiloc: {
          en: 'Project 1',
        },
        updated_at: '2021-05-18T16:07:27.123Z',
      },
    },
    {
      id: project2Id,
      type: 'project',
      attributes: {
        ideas_count: 5,
        title_multiloc: {
          en: 'Project 2',
        },
        updated_at: '2021-05-18T16:07:49.156Z',
      },
    },
    {
      id: '1aa8a788-3aee',
      type: 'project',
      attributes: {
        ideas_count: 0,
        title_multiloc: {
          en: 'Project 3',
        },
        updated_at: '2021-05-18T16:07:49.156Z',
      },
    },
  ],
} as GetProjectsChildProps;

describe('Create Insights View', () => {
  it('renders Create Insights View', () => {
    render(
      <CreateInsightsView
        projects={mockProjectsData}
        closeCreateModal={closeModal}
      />
    );
    expect(screen.getByTestId('insightsCreateModal')).toBeInTheDocument();
  });
  it('filters out projects with no ideas', () => {
    render(
      <CreateInsightsView
        projects={mockProjectsData}
        closeCreateModal={closeModal}
      />
    );
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
  it('creates a view with correct viewName and scope', () => {
    const viewName = 'New name';

    const spy = jest.spyOn(service, 'addInsightsView');
    render(
      <CreateInsightsView
        projects={mockProjectsData}
        closeCreateModal={closeModal}
      />
    );

    fireEvent.input(screen.getByLabelText('Name'), {
      target: {
        value: viewName,
      },
    });

    userEvent.selectOptions(screen.getByLabelText('Project'), project2Id);

    fireEvent.click(screen.getByText('Create my insights'));

    expect(spy).toHaveBeenCalledWith({ name: viewName, scope_id: project2Id });
  });
  it('cannot save without a scope', () => {
    const viewName = 'New name';

    render(
      <CreateInsightsView
        projects={mockProjectsData}
        closeCreateModal={closeModal}
      />
    );

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: viewName,
      },
    });

    expect(screen.getAllByRole('button')[0]).toBeDisabled();
  });
});
