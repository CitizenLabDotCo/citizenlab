import React from 'react';
import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsCategories';

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
}));

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockData);
});

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

const viewId = '1';

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={{ pathname: '', query: {} }}
          />
        );
      };
    },
  };
});

describe('Insights Edit', () => {
  it('renders Edit screen', () => {
    render(<InsightsEdit />);
    expect(screen.getByTestId('insightsEdit')).toBeInTheDocument();
  });
  describe('Categories', () => {
    it('renders correct number of categories', () => {
      render(<InsightsEdit />);
      expect(screen.getAllByTestId('insightsCategory')).toHaveLength(2);
    });
    it('renders Infobox when no categories are available', () => {
      mockData = [];
      render(<InsightsEdit />);
      expect(screen.getByTestId('insightsNoCategories')).toBeInTheDocument();
    });
    it('adds category with correct view id and name ', async () => {
      const categoryName = 'New category';
      const spy = jest.spyOn(service, 'addInsightsCategory');
      render(<InsightsEdit />);

      fireEvent.input(screen.getByPlaceholderText('Add category'), {
        target: {
          value: categoryName,
        },
      });

      await act(async () => {
        fireEvent.click(screen.getByText('+'));
      });

      expect(spy).toHaveBeenCalledWith(viewId, categoryName);
    });
  });
});
