import React from 'react';
import CreateCategory from './CreateCategory';

import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';
import categories from 'modules/commercial/insights/fixtures/categories';
import { addInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

const viewId = '1';

jest.mock('services/locale');
jest.mock('utils/cl-intl');

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
    Link: () => 'Link',
  };
});

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
}));

const defaultProps = {
  closeCreateModal: jest.fn(),
  search: 'search',
  keywords: ['a', 'b', 'c'],
  categories,
};

describe('Insights CreateCategory from filters', () => {
  it('renders', () => {
    render(<CreateCategory {...defaultProps} />);
    expect(
      screen.getByTestId('insightsDetailsCreateCategory')
    ).toBeInTheDocument();
  });

  it('shows categories', () => {
    render(<CreateCategory {...defaultProps} />);
    categories.map((category) => {
      expect(screen.getByText(category.attributes.name)).toBeInTheDocument();
    });
  });

  it('shows keywords', () => {
    render(<CreateCategory {...defaultProps} />);
    defaultProps.keywords.map((keyword) => {
      expect(screen.getByText(keyword)).toBeInTheDocument();
    });
  });

  it('shows search', () => {
    render(<CreateCategory {...defaultProps} />);
    expect(screen.getByText(defaultProps.search)).toBeInTheDocument();
  });

  it('adds category with correct view id and name', async () => {
    const categoryName = 'New category';

    render(<CreateCategory {...defaultProps} />);

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: categoryName,
      },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByTestId('insightsDetailsCreateCategoryConfirm')
      );
    });

    const categoryIds = defaultProps.categories.map((category) => category.id);
    expect(addInsightsCategory).toHaveBeenCalledWith({
      insightsViewId: viewId,
      name: categoryName,
      inputs: {
        categories: categoryIds,
        keywords: defaultProps.keywords,
        search: defaultProps.search,
      },
    });
  });
});
