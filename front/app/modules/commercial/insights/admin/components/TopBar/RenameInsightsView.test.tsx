import React from 'react';
import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsViews';

import RenameInsightsView from './RenameInsightsView';

const viewId = '1';

jest.mock('modules/commercial/insights/services/insightsViews', () => ({
  updateInsightsView: jest.fn(),
}));

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
}));

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
    Link: 'Link',
  };
});

describe('Rename Insights View', () => {
  it('renames view with correct viewId and name', () => {
    const viewName = 'New name';

    const spy = jest.spyOn(service, 'updateInsightsView');
    const closeModal = () => jest.fn();
    render(
      <RenameInsightsView
        originalViewName="Name"
        insightsViewId={viewId}
        closeRenameModal={closeModal}
      />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('value', 'Name');
    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: viewName,
      },
    });

    act(() => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(spy).toHaveBeenCalledWith(viewId, viewName);
  });
});
