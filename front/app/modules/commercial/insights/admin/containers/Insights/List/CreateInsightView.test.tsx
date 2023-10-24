import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('resources/GetProjects', () => {});

const mockMutate = jest.fn();
jest.mock('modules/commercial/insights/api/views/useCreateView', () =>
  jest.fn(() => ({ mutate: mockMutate, reset: jest.fn() }))
);

import { CreateInsightsView } from './CreateInsightsView';
import { project1, project2 } from 'api/projects/__mocks__/_mockServer';

const closeModal = jest.fn();

jest.mock('api/projects/useProjects');

describe('CreateInsightsView', () => {
  it('renders Create Insights View', () => {
    render(<CreateInsightsView closeCreateModal={closeModal} />);
    expect(screen.getByTestId('insightsCreateModal')).toBeInTheDocument();
  });
  it('filters out projects with no ideas', () => {
    render(<CreateInsightsView closeCreateModal={closeModal} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });
  it('creates a view with correct viewName and projectId', () => {
    const viewName = 'New name';

    render(<CreateInsightsView closeCreateModal={closeModal} />);

    fireEvent.input(screen.getByLabelText('Name'), {
      target: {
        value: viewName,
      },
    });
    screen.getAllByRole('checkbox')[0].click();
    fireEvent.click(screen.getByText('Create my insights'));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        view: {
          name: viewName,
          data_sources: [{ origin_id: project1.id }],
        },
      },
      { onSuccess: expect.any(Function) }
    );
  });

  it('creates a view with correct viewName and multiple project ids', () => {
    const viewName = 'New name';

    render(<CreateInsightsView closeCreateModal={closeModal} />);

    fireEvent.input(screen.getByLabelText('Name'), {
      target: {
        value: viewName,
      },
    });
    screen.getAllByRole('checkbox')[0].click();
    screen.getAllByRole('checkbox')[1].click();
    fireEvent.click(screen.getByText('Create my insights'));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        view: {
          name: viewName,
          data_sources: [
            { origin_id: project1.id },
            { origin_id: project2.id },
          ],
        },
      },
      { onSuccess: expect.any(Function) }
    );
  });

  it('cannot save without projects being selected', () => {
    const viewName = 'New name';

    render(<CreateInsightsView closeCreateModal={closeModal} />);

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: viewName,
      },
    });

    expect(screen.getAllByRole('button')[0]).toBeDisabled();
  });
});
