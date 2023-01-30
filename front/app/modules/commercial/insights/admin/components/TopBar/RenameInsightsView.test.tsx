import React from 'react';
import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';

import RenameInsightsView from './RenameInsightsView';

const viewId = '1';

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
}));

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
  };
});
jest.mock('utils/cl-router/Link');

const mockMutate = jest.fn();
jest.mock('modules/commercial/insights/services/views', () => {
  return {
    useUpdateView: jest.fn(() => {
      return { mutate: mockMutate, reset: jest.fn() };
    }),
  };
});

describe('Rename Insights View', () => {
  it('renames view with correct viewId and name', () => {
    const viewName = 'New name';

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

    expect(mockMutate).toHaveBeenCalledWith({
      id: viewId,
      requestBody: { view: { name: viewName } },
    });
  });
});
