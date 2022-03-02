import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsViews';

jest.mock('modules/commercial/insights/services/insightsViews', () => ({
  addInsightsView: jest.fn(),
}));

jest.mock('utils/cl-intl');
jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('resources/GetProjects', () => {});
jest.mock('hooks/useLocalize');
jest.mock('services/locale');

import { CreateInsightsView } from './CreateInsightsView';
import { GetProjectsChildProps } from 'resources/GetProjects';

const closeModal = jest.fn();

const project1Id = '1aa8a788-3aee-4ada-a581-6d934e49784b';

const project2Id = '4b429681-1744-456f-8550-e89a2c2c74b2';

const mockProjectsData = {
  projectsList: [
    {
      id: project1Id,
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
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });
  it('creates a view with correct viewName and projectId', () => {
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
    screen.getAllByRole('checkbox')[1].click();
    fireEvent.click(screen.getByText('Create my insights'));

    expect(spy).toHaveBeenCalledWith({
      name: viewName,
      data_sources: [{ origin_id: project2Id }],
    });
  });

  it('creates a view with correct viewName and multiple project ids', () => {
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
    screen.getAllByRole('checkbox')[0].click();
    screen.getAllByRole('checkbox')[1].click();
    fireEvent.click(screen.getByText('Create my insights'));

    expect(spy).toHaveBeenCalledWith({
      name: viewName,
      data_sources: [{ origin_id: project1Id }, { origin_id: project2Id }],
    });
  });

  it('cannot save without projects being selected', () => {
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
