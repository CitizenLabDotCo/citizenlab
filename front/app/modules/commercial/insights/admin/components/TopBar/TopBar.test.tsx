import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import { deleteInsightsView } from 'modules/commercial/insights/services/insightsViews';
import clHistory from 'utils/cl-router/history';

import TopBar from './';

const DEFAULT_MOCK_VIEW_DATA = {
  data: {
    id: '1',
    type: 'view',
    attributes: {
      name: 'Test View',
      updated_at: '2021-05-31T11:02:44.608Z',
    },
    relationships: {
      data_sources: {
        data: [{ id: '2' }],
      },
    },
  },
};

const MOCK_VIEW_DATA_TWO_PROJECTS = {
  data: {
    id: '1',
    type: 'view',
    attributes: {
      name: 'Test View',
      updated_at: '2021-05-31T11:02:44.608Z',
    },
    relationships: {
      data_sources: {
        data: [{ id: '2' }, { id: '3' }],
      },
    },
  },
};

let mockViewData: any = DEFAULT_MOCK_VIEW_DATA;

const mockProjectData2 = {
  id: '2',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
  },
};

const mockProjectData3 = {
  id: '3',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Another Project' },
    slug: 'test2',
  },
};

const viewId = '1';

jest.mock('utils/cl-router/Link');
jest.mock('modules');

jest.mock('modules/commercial/insights/services/insightsViews', () => ({
  deleteInsightsView: jest.fn(),
}));

jest.mock('utils/cl-intl');
jest.mock('utils/analytics');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/hooks/useInsightsView', () => {
  return jest.fn(() => mockViewData);
});

jest.mock('hooks/useProject', () => {
  return jest.fn(({ projectId }) =>
    projectId === '2' ? mockProjectData2 : mockProjectData3
  );
});

jest.mock('hooks/useLocale');

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
  };
});
jest.mock('utils/cl-router/Link');

jest.mock('utils/cl-router/history');

describe('Insights Top Bar', () => {
  it('renders Top Bar', () => {
    render(<TopBar />);
    expect(screen.getByTestId('insightsTopBar')).toBeInTheDocument();
  });

  it('renders View name correctly', () => {
    render(<TopBar />);
    expect(
      screen.getByText(mockViewData.data.attributes.name)
    ).toBeInTheDocument();
  });

  it('if only one project: renders Project button with correct slug', () => {
    render(<TopBar />);
    expect(screen.getByTestId('insightsProjectButton')).toBeInTheDocument();
    expect(
      screen.queryByTestId('insightsProjectDropdown')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/en/projects/test'
    );
  });

  it('if multiple projects: renders Project dropdown with correct content', async () => {
    mockViewData = MOCK_VIEW_DATA_TWO_PROJECTS;
    render(<TopBar />);
    expect(screen.getByTestId('insightsProjectDropdown')).toBeInTheDocument();
    expect(
      screen.queryByTestId('insightsProjectButton')
    ).not.toBeInTheDocument();

    const dropdown = screen.getByTestId('insightsProjectDropdown');
    fireEvent.click(dropdown);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Another Project')).toBeInTheDocument();

      expect(screen.getByText('Test Project')).toHaveAttribute(
        'href',
        '/en/projects/test'
      );

      expect(screen.getByText('Another Project')).toHaveAttribute(
        'href',
        '/en/projects/test2'
      );
    });
  });

  it('deletes view on menu item click', () => {
    mockViewData = DEFAULT_MOCK_VIEW_DATA;
    render(<TopBar />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Delete'));
    expect(deleteInsightsView).toHaveBeenCalledWith(mockViewData.data.id);
  });

  it('redirects to main screen there is view error', () => {
    mockViewData = new Error();
    render(<TopBar />);

    expect(clHistory.push).toHaveBeenCalledWith('/admin/insights');
  });
});
