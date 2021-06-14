import React from 'react';
import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsCategories';

import RenameCategory from './RenameCategory';

const viewId = '1';
const categoryId = '1';

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  updateInsightsCategory: jest.fn(),
}));

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

jest.mock('react-router', () => {
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
    Link: 'Link',
  };
});

describe('Rename Category', () => {
  it('renames view with correct viewId and name', () => {
    const categoryName = 'New name';

    const spy = jest.spyOn(service, 'updateInsightsCategory');
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

    expect(spy).toHaveBeenCalledWith(viewId, categoryId, categoryName);
  });
});
