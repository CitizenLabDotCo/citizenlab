import categories from 'modules/commercial/insights/fixtures/categories';
import React from 'react';
import { render, screen, fireEvent, act, within } from 'utils/testUtils/rtl';

import TableTitle from './TableTitle';

const mockDelete = jest.fn();

jest.mock('modules/commercial/insights/api/categories/useCategories');

jest.mock('modules/commercial/insights/api/categories/useDeleteCategory', () =>
  jest.fn(() => ({ mutate: mockDelete, reset: jest.fn() }))
);

const viewId = '1';

let mockLocationData = { pathname: '', query: {} };

jest.mock('utils/cl-router/withRouter', () => {
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

describe('Table Title', () => {
  it('shows All Input title correctly', () => {
    render(<TableTitle />);
    expect(
      screen.getByTestId('insightsTableHeaderAllInput')
    ).toBeInTheDocument();
  });
  it('shows Not categorized title correctly', () => {
    mockLocationData = { pathname: '', query: { category: '' } };
    render(<TableTitle />);
    expect(
      screen.getByTestId('insightsTableHeaderNotCategorized')
    ).toBeInTheDocument();
  });
  it('shows Recently posted title correctly', () => {
    mockLocationData = { pathname: '', query: { processed: 'false' } };
    render(<TableTitle />);
    expect(
      screen.getByTestId('insightsTableHeaderRecentlyPosted')
    ).toBeInTheDocument();
  });
  it('shows selected category correctly', () => {
    mockLocationData = { pathname: '', query: { category: categories[0].id } };
    render(<TableTitle />);
    expect(
      within(screen.getByTestId('insightsInputsHeader')).getByText(
        categories[0].attributes.name
      )
    ).toBeInTheDocument();
  });

  it('deletes category correctly', async () => {
    mockLocationData = { pathname: '', query: { category: categories[0].id } };
    render(<TableTitle />);
    fireEvent.click(
      within(screen.getByTestId('insightsInputsHeader')).getByRole('button')
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Delete category'));
    });
    expect(mockDelete).toHaveBeenCalledWith(
      {
        viewId,
        categoryId: categories[0].id,
      },
      {
        onSuccess: expect.any(Function),
      }
    );
  });
});
