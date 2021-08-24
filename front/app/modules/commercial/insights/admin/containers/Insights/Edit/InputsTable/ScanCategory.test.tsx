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

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

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
  it('renders as banner', () => {
    render(<ScanCategory variant="banner" />);
    expect(
      screen.getByTestId('insightsScanCategory-banner')
    ).toBeInTheDocument();
  });

  it('renders as button', () => {
    render(<ScanCategory variant="button" />);
    expect(
      screen.getByTestId('insightsScanCategory-button')
    ).toBeInTheDocument();
  });

  it('disables button if there are pending tasks as banner', () => {
    render(<ScanCategory variant="banner" />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls insightsTriggerCategoriesSuggestionsTasks with correct arguments on button click when no pending tasks as banner', () => {
    mockCategoriesSuggestionsTasks = [];
    render(<ScanCategory variant="banner" />);
    fireEvent.click(screen.getByRole('button'));

    expect(
      insightsTriggerCategoriesSuggestionsTasks
    ).toHaveBeenCalledWith(viewId, [categoryId]);
  });

  it('disables button if there are pending tasks as button', () => {
    render(<ScanCategory variant="button" />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls insightsTriggerCategoriesSuggestionsTasks with correct arguments on button click when no pending tasks as button', () => {
    mockCategoriesSuggestionsTasks = [];
    render(<ScanCategory variant="button" />);
    fireEvent.click(screen.getByRole('button'));

    expect(
      insightsTriggerCategoriesSuggestionsTasks
    ).toHaveBeenCalledWith(viewId, [categoryId]);
  });
  it('does not render scan category when no nlp feature flag as banner', () => {
    mockFeatureFlagData = false;

    render(<ScanCategory variant="banner" />);
    expect(
      screen.queryByTestId('insightsScanCategory-banner')
    ).not.toBeInTheDocument();
  });
  it('does not render scan category when no nlp feature flag as button', () => {
    mockFeatureFlagData = false;

    render(<ScanCategory variant="button" />);
    expect(
      screen.queryByTestId('insightsScanCategory-button')
    ).not.toBeInTheDocument();
  });
});
