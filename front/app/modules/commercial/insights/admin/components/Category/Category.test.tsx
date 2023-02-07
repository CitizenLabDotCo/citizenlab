import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import categories from '../../../fixtures/categories';

const mockAddInputCategories = jest.fn();
jest.mock('modules/commercial/insights/api/inputs/useAddInputCategories', () =>
  jest.fn(() => ({ mutate: mockAddInputCategories }))
);

const mockDeletenputCategory = jest.fn();
jest.mock('modules/commercial/insights/api/inputs/useDeleteInputCategory', () =>
  jest.fn(() => ({ mutate: mockDeletenputCategory }))
);

import Category from './';

const viewId = '1';
const inputId = '2';
const categoryId = '3';

jest.mock('modules/commercial/insights/api/categories/useCategory');

jest.mock('utils/cl-router/withRouter', () => {
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
    render(<Category variant="approved" id={categoryId} inputId={inputId} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    expect(screen.getByText(categories[0].attributes.name)).toBeInTheDocument();
  });

  it('renders Tag with correct variant when suggested', () => {
    render(<Category variant="suggested" id={categoryId} inputId={inputId} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    expect(
      screen.getByTestId('insightsTagContent-default')
    ).toBeInTheDocument();
  });

  it('renders Tag with correct variant when approved', () => {
    render(<Category variant="approved" id={categoryId} inputId={inputId} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    expect(
      screen.getByTestId('insightsTagContent-primary')
    ).toBeInTheDocument();
  });

  it('calls delete category with correct arguments when variant is approved', () => {
    render(<Category variant="approved" id={categoryId} inputId={inputId} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    const deleteIcon = screen
      .getByTestId('insightsTag')
      .querySelector('.insightsTagCloseIcon');

    if (deleteIcon) {
      fireEvent.click(deleteIcon);
    }

    expect(mockDeletenputCategory).toHaveBeenCalledWith({
      viewId,
      inputId,
      categoryId,
    });
  });
  it('calls add category with correct arguments when variant is suggested', () => {
    render(<Category variant="suggested" id={categoryId} inputId={inputId} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    const plusIcon = screen
      .getByTestId('insightsTag')
      .querySelector('.insightsTagPlusIcon');

    if (plusIcon) {
      fireEvent.click(plusIcon);
    }

    expect(mockAddInputCategories).toHaveBeenCalledWith({
      viewId,
      inputId,
      categories: [{ id: categoryId, type: 'category' }],
    });
  });
  it('does not render delete icon when variant is approved when withAction is false', () => {
    render(
      <Category
        variant="approved"
        id={categoryId}
        inputId={inputId}
        withAction={false}
      />
    );
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    const deleteIcon = screen
      .getByTestId('insightsTag')
      .querySelector('.insightsTagCloseIcon');

    expect(deleteIcon).not.toBeInTheDocument();
  });
  it('does not render plus icon when variant is suggested when withAction is false', () => {
    render(
      <Category
        variant="suggested"
        id={categoryId}
        inputId={inputId}
        withAction={false}
      />
    );
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    const plusIcon = screen
      .getByTestId('insightsTag')
      .querySelector('.insightsTagPlusIcon');

    expect(plusIcon).not.toBeInTheDocument();
  });
});
