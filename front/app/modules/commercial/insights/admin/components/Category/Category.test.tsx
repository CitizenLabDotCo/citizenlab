import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsInputs';

jest.mock('modules/commercial/insights/services/insightsInputs', () => ({
  deleteInsightsInputCategory: jest.fn(),
}));

import Category from './';

const viewId = '1';
const inputId = '2';
const categoryId = '3';

const mockCategoryData = {
  id: '3612e489-a631-4e7d-8bdb-63be407ea123',
  type: 'category',
  attributes: {
    name: 'Category 1',
  },
};

jest.mock('modules/commercial/insights/hooks/useInsightsCategory', () => {
  return jest.fn(() => mockCategoryData);
});

jest.mock('hooks/useLocale');

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
  };
});

describe('Insights Category', () => {
  it('renders Tag with correct name', () => {
    render(<Category id={categoryId} inputId={inputId} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    expect(
      screen.getByText(mockCategoryData.attributes.name)
    ).toBeInTheDocument();
  });
  it('calls delete category with correct arguments', () => {
    const spy = jest.spyOn(service, 'deleteInsightsInputCategory');
    render(<Category id={categoryId} inputId={inputId} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    const deleteIcon = screen
      .getByTestId('insightsTag')
      .querySelector('.insightsTagCloseIcon');

    if (deleteIcon) {
      fireEvent.click(deleteIcon);
    }

    expect(spy).toHaveBeenCalledWith(viewId, inputId, categoryId);
  });
});
