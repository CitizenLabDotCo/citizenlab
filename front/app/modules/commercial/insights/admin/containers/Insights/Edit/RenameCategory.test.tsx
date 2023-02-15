import React from 'react';
import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';

import RenameCategory from './RenameCategory';

const viewId = '1';
const categoryId = '1';

const mockUpdateCategory = jest.fn();

jest.mock('modules/commercial/insights/api/categories/useUpdateCategory', () =>
  jest.fn(() => ({ mutate: mockUpdateCategory, reset: jest.fn() }))
);

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={{ query: { category: '1' } }}
          />
        );
      };
    },
  };
});

describe('Rename Category', () => {
  it('renames view with correct viewId and name', () => {
    const categoryName = 'New name';

    const closeModal = () => jest.fn();
    render(
      <RenameCategory
        originalCategoryName="Name"
        closeRenameModal={closeModal}
      />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('value', 'Name');
    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: categoryName,
      },
    });

    act(() => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(mockUpdateCategory).toHaveBeenCalledWith(
      {
        viewId,
        categoryId,
        requestBody: { name: categoryName },
      },
      {
        onSuccess: expect.any(Function),
      }
    );
  });
});
