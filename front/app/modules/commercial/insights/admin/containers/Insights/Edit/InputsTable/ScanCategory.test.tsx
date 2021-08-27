import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import { insightsTriggerCategoriesSuggestionsTasks } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

import ScanCategory from './ScanCategory';

let mockCategoriesSuggestionsTasks = [
  {
    id: '58ed4a03-155b-4b60-ac9e-cf101e6d94d0',
    type: 'zeroshot_classification_task',
    attributes: {
      created_at: '2021-07-08T12:01:53.254Z',
    },
    relationships: {
      categories: {
        data: [
          {
            id: 'e499e92b-3d9a-4147-99ed-4abdc4fe558f',
            type: 'category',
          },
        ],
      },
      inputs: {
        data: [
          {
            id: '20c7e056-7c7c-477f-bf0e-72a7ce6fb515',
            type: 'input',
          },
        ],
      },
    },
  },
  {
    id: '140b1468-8b49-4999-a51c-084d8e17eefa',
    type: 'zeroshot_classification_task',
    attributes: {
      created_at: '2021-07-08T12:01:53.330Z',
    },
    relationships: {
      categories: {
        data: [
          {
            id: 'e499e92b-3d9a-4147-99ed-4abdc4fe558f',
            type: 'category',
          },
        ],
      },
      inputs: {
        data: [
          {
            id: 'e8b3aa62-4ea2-474b-a97b-872e7ca47b73',
            type: 'input',
          },
        ],
      },
    },
  },
];

jest.mock('utils/cl-intl');

jest.mock(
  'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks',
  () => ({
    insightsTriggerCategoriesSuggestionsTasks: jest.fn(),
  })
);

jest.mock(
  'modules/commercial/insights/hooks/useInsightsCategoriesSuggestionsTasks',
  () => {
    return jest.fn(() => mockCategoriesSuggestionsTasks);
  }
);

jest.mock('hooks/useLocale');

const viewId = '1';
const categoryId = '2';

const mockLocationData = { pathname: '', query: { category: categoryId } };

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

describe('Scan category', () => {
  it('renders', () => {
    render(<ScanCategory />);
    expect(screen.getByTestId('insightsScanCategory')).toBeInTheDocument();
  });

  it('disables button if there are pending tasks', () => {
    render(<ScanCategory />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls insightsTriggerCategoriesSuggestionsTasks with correct arguments on button click when no pending tasks', () => {
    mockCategoriesSuggestionsTasks = [];
    render(<ScanCategory />);
    fireEvent.click(screen.getByRole('button'));

    expect(
      insightsTriggerCategoriesSuggestionsTasks
    ).toHaveBeenCalledWith(viewId, [categoryId]);
  });
});
