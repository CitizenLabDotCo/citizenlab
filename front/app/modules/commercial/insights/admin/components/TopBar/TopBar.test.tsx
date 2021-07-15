import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsViews';

import TopBar from './';

const mockViewData = {
  id: '1',
  type: 'view',
  attributes: {
    name: 'Test View',
    updated_at: '2021-05-31T11:02:44.608Z',
  },
  relationships: {
    scope: {
      data: { id: '2', type: 'project' },
    },
  },
};

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
  },
};

const viewId = '1';

jest.mock('modules/commercial/insights/services/insightsViews', () => ({
  deleteInsightsView: jest.fn(),
}));

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/hooks/useInsightsView', () => {
  return jest.fn(() => mockViewData);
});

jest.mock('hooks/useProject', () => {
  return jest.fn(() => mockProjectData);
});

jest.mock('hooks/useLocale');

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
    Link: (props) => <a href={props.to.pathname}>{props.children}</a>,
  };
});

describe('Insights Top Bar', () => {
  it('renders Top Bar', () => {
    render(<TopBar />);
    expect(screen.getByTestId('insightsTopBar')).toBeInTheDocument();
  });
  it('renders View name correctly', () => {
    render(<TopBar />);
    expect(screen.getByText(mockViewData.attributes.name)).toBeInTheDocument();
  });
  it('renders Project button with correct slug', () => {
    render(<TopBar />);
    expect(screen.getByTestId('insightsProjectButton')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/en/projects/test'
    );
  });
  it('deletes view on menu item click', () => {
    render(<TopBar />);
    const spy = jest.spyOn(service, 'deleteInsightsView');
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Delete'));
    expect(spy).toHaveBeenCalledWith(mockViewData.id);
  });
});
