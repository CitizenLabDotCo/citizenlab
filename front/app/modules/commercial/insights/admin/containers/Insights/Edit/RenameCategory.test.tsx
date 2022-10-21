import * as service from 'modules/commercial/insights/services/insightsCategories';
import React from 'react';
import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import RenameCategory from './RenameCategory';

const viewId = '1';
const categoryId = '1';

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  updateInsightsCategory: jest.fn(),
}));

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('utils/cl-router/Link');

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
