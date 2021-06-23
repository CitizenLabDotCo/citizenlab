import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import clHistory from 'utils/cl-router/history';

import Categories from './';

let mockData = [
  {
    id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
    type: 'category',
    attributes: {
      name: 'Test',
    },
  },
  {
    id: '4b429681-1744-456f-8550-e89a2c2c74b2',
    type: 'category',
    attributes: {
      name: 'Test 2',
    },
  },
];

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockData);
});

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

const viewId = '1';

const mockLocationData = { pathname: 'details', query: {} };

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
    Link: () => 'Link',
  };
});

describe('Insights Details Categories', () => {
  it('renders Categories', () => {
    render(<Categories />);
    expect(screen.getByTestId('insightsDetailsCategories')).toBeInTheDocument();
  });

  it('renders correct number of categories', () => {
    render(<Categories />);
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(2);
  });

  it('selects category correctly', () => {
    const spy = jest.spyOn(clHistory, 'push');
    render(<Categories />);
    fireEvent.click(screen.getByText(mockData[0].attributes.name));
    expect(spy).toHaveBeenCalledWith({
      pathname: '',
      search: `?category=${mockData[0].id}`,
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

// Show more/less
