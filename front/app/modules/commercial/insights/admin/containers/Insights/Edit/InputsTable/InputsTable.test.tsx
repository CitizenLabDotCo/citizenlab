import React from 'react';
import { render, screen, fireEvent, within } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsInputs';

jest.mock('modules/commercial/insights/services/insightsInputs', () => ({
  deleteInsightsInputCategory: jest.fn(),
}));

import InputsTable from './';

const viewId = '1';

let mockInputData = [
  {
    id: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
    type: 'input',
    relationships: {
      source: {
        data: {
          id: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
          type: 'idea',
        },
      },
      categories: {
        data: [
          {
            id: '94a649b5-23fe-4d47-9165-9beceef2dcad',
            type: 'category',
          },
          {
            id: '94a649b5-23fe-4d47-9165-9becedfg45sd',
            type: 'category',
          },
        ],
      },
      suggested_categories: {
        data: [],
      },
    },
  },
  {
    id: '54438f73-12f4-4b16-84f3-a55bd118de7e',
    type: 'input',
    relationships: {
      source: {
        data: {
          id: '54438f73-12f4-4b16-84f3-a55bd118de7e',
          type: 'idea',
        },
      },
      categories: {
        data: [],
      },
      suggested_categories: {
        data: [],
      },
    },
  },
];

const mockIdeaData = {
  id: '2',
  type: 'idea',
  attributes: {
    title_multiloc: { en: 'Test Idea' },
  },
};

const mockCategoryData = {
  id: '3612e489-a631-4e7d-8bdb-63be407ea123',
  type: 'category',
  attributes: {
    name: 'Category 1',
  },
};

let mockLocationData = { pathname: '', query: {} };

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsCategory', () => {
  return jest.fn(() => mockCategoryData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsInputs', () => {
  return jest.fn(() => mockInputData);
});

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

jest.mock('utils/cl-intl');

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
  };
});

window.confirm = jest.fn(() => true);

describe('Insights Input Table', () => {
  it('renders', () => {
    render(<InputsTable />);
    expect(screen.getByTestId('insightsInputsTable')).toBeInTheDocument();
  });
  it('renders correct number of rows', () => {
    render(<InputsTable />);
    expect(screen.getAllByTestId('insightsInputsTableRow')).toHaveLength(2);
  });
  it('renders list of categories correctly', () => {
    render(<InputsTable />);
    const firstRow = screen.getAllByTestId('insightsInputsTableRow')[0];
    const secondRow = screen.getAllByTestId('insightsInputsTableRow')[1];
    expect(within(firstRow).getAllByTestId('insightsTag')).toHaveLength(2);
    expect(within(secondRow).queryAllByTestId('insightsTag')).toHaveLength(0);
  });
  it('calls onDelete category with correct arguments', () => {
    const spy = jest.spyOn(service, 'deleteInsightsInputCategory');
    render(<InputsTable />);
    const firstTagDeleteIcon = screen
      .getAllByTestId('insightsTag')[0]
      .querySelector('.insightsTagCloseIcon');
    if (firstTagDeleteIcon) {
      fireEvent.click(firstTagDeleteIcon);
    }

    expect(spy).toHaveBeenCalledWith(
      viewId,
      mockInputData[0].id,
      mockInputData[0].relationships.categories.data[0].id
    );
  });
  it('renders table empty state when there are no inputs', () => {
    mockInputData = [];
    render(<InputsTable />);
    expect(
      screen.getByTestId('insightsInputsTableEmptyState')
    ).toBeInTheDocument();
    expect(
      screen.getByText("This project doesn't seem to contain any input.")
    ).toBeInTheDocument();
  });
  it('renders correct table empty state when are no categories for input', () => {
    mockLocationData = { pathname: '', query: { category: 'category' } };
    mockInputData = [];

    render(<InputsTable />);
    expect(
      screen.getByTestId('insightsInputsTableEmptyState')
    ).toBeInTheDocument();
    expect(
      screen.getByText('You have no input assigned to this category yet')
    ).toBeInTheDocument();
  });

  // renders additional column when category is selected
  // sorts +
  // sorts -
});
