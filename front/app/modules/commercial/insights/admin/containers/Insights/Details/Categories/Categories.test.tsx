import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import clHistory from 'utils/cl-router/history';
import categories from 'modules/commercial/insights/fixtures/categories';

import Categories, { visibleCategoriesNumber } from './';

let mockData = categories;

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockData);
});

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

const viewId = '1';

const mockLocationData = { pathname: '', query: {} };

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={mockLocationData}
          />
        );
      };
    },
    Link: () => <>Link</>,
  };
});

describe('Insights Details Categories', () => {
  it('renders Categories', () => {
    render(<Categories />);
    expect(screen.getByTestId('insightsDetailsCategories')).toBeInTheDocument();
  });

  it('renders correct number of categories', () => {
    render(<Categories />);
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(
      visibleCategoriesNumber
    );
  });

  it('renders correct number of categories on See all and See less click', async () => {
    render(<Categories />);
    fireEvent.click(screen.getByText('See all'));
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(mockData.length);
    fireEvent.click(screen.getByText('See less'));
    await waitFor(() =>
      expect(screen.getAllByTestId('insightsTag')).toHaveLength(
        visibleCategoriesNumber
      )
    );
  });

  it('does not render See all button when categories are less then visibleCategoriesNumber', () => {
    mockData = [
      {
        id: '727a021c-d1f9-4006-a5c2-8532aa779dd6',
        type: 'category',
        attributes: { name: 'Nature and animals', inputs_count: 0 },
        relationships: {
          view: {
            data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
          },
        },
      },
    ];
    render(<Categories />);

    expect(screen.queryByText('See all')).not.toBeInTheDocument();
  });

  it('selects category correctly', () => {
    const spy = jest.spyOn(clHistory, 'push');
    render(<Categories />);
    fireEvent.click(screen.getByText(mockData[0].attributes.name));
    expect(spy).toHaveBeenCalledWith({
      pathname: '',
      search: `?category=${mockData[0].id}&page=1`,
    });
  });

  it('renders Empty state when there are no categories', () => {
    mockData = [];
    render(<Categories />);
    expect(
      screen.getByTestId('insightsDetailsCategoriesEmpty')
    ).toBeInTheDocument();
  });
});
