import React from 'react';
import { render, screen, fireEvent, act, waitFor } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsCategories';
import clHistory from 'utils/cl-router/history';

import InsightsEdit from './';

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

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
  deleteInsightsCategories: jest.fn(),
  deleteInsightsCategory: jest.fn(),
}));

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
    Link: () => 'Link',
  };
});

window.confirm = jest.fn(() => true);

describe('Insights Edit', () => {
  it('renders Edit screen', () => {
    render(<InsightsEdit />);
    expect(screen.getByTestId('insightsEdit')).toBeInTheDocument();
  });
  it('adds search query to url', () => {
    const spy = jest.spyOn(clHistory, 'push');
    render(<InsightsEdit />);
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: {
        value: 'search',
      },
    });

    waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        pathname: '',
        search: `?search=search`,
      });
    });
  });
  describe('Categories', () => {
    it('renders correct number of categories', () => {
      render(<InsightsEdit />);
      expect(screen.getAllByTestId('insightsCategory')).toHaveLength(2);
    });
    it('selects category correctly', () => {
      const spy = jest.spyOn(clHistory, 'push');
      render(<InsightsEdit />);
      fireEvent.click(screen.getByText(mockData[0].attributes.name));
      expect(spy).toHaveBeenCalledWith({
        pathname: '',
        search: `?pageNumber=1&category=${mockData[0].id}`,
      });
    });

    it('selects all input correctly', () => {
      const spy = jest.spyOn(clHistory, 'push');
      render(<InsightsEdit />);
      fireEvent.click(screen.getAllByText('All input')[0]);
      expect(spy).toHaveBeenCalledWith({
        pathname: '',
        search: `?pageNumber=1`,
      });
    });

    it('selects uncategorized input correctly', () => {
      const spy = jest.spyOn(clHistory, 'push');
      render(<InsightsEdit />);
      fireEvent.click(screen.getAllByText('Not categorized')[0]);
      expect(spy).toHaveBeenCalledWith({
        pathname: '',
        search: `?pageNumber=1&category=`,
      });
    });

    it('renders Infobox when no categories are available', () => {
      mockData = [];
      render(<InsightsEdit />);
      expect(screen.getByTestId('insightsNoCategories')).toBeInTheDocument();
    });
    it('adds category with correct view id and name', async () => {
      const categoryName = 'New category';

      render(<InsightsEdit />);

      fireEvent.input(screen.getByPlaceholderText('Add category'), {
        target: {
          value: categoryName,
        },
      });

      await act(async () => {
        fireEvent.click(screen.getByText('+'));
      });

      expect(service.addInsightsCategory).toHaveBeenCalledWith(
        viewId,
        categoryName
      );
    });
    it('resets categories', async () => {
      const spy = jest.spyOn(service, 'deleteInsightsCategories');
      render(<InsightsEdit />);

      await act(async () => {
        fireEvent.click(screen.getByText('Reset categories'));
      });

      expect(spy).toHaveBeenCalledWith(viewId);
    });
  });
});
