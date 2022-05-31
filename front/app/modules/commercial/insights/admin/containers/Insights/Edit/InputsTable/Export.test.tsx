import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import { requestBlob } from 'utils/request';

import views from 'modules/commercial/insights/fixtures/views';
import Export from './Export';

const viewId = '1';
const apiPath = '/web_api/v1/insights/views/1/inputs/as_xlsx';
const application =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const mockViewData = views[0];
let mockLocationData: { query: Record<string, unknown> } = { query: {} };

jest.mock('modules/commercial/insights/hooks/useInsightsView', () => {
  return jest.fn(() => mockViewData);
});

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('services/locale');
jest.mock('utils/request');

jest.mock('utils/withRouter', () => {
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

describe('Insights Export', () => {
  it('renders', () => {
    render(<Export />);
    expect(screen.getByTestId('insightsExport')).toBeInTheDocument();
  });
  it('calls requestBlob with correct arguments when processed is true', async () => {
    mockLocationData = { query: { category: 'category', processed: 'true' } };
    render(<Export />);
    fireEvent.click(screen.getByRole('button'));

    expect(requestBlob).toHaveBeenCalledWith(apiPath, application, {
      category: 'category',
      processed: true,
    });
  });

  it('calls requestBlob with correct arguments when processed is false', async () => {
    mockLocationData = { query: { category: 'category', processed: 'false' } };
    render(<Export />);
    fireEvent.click(screen.getByRole('button'));

    expect(requestBlob).toHaveBeenCalledWith(apiPath, application, {
      category: 'category',
      processed: false,
    });
  });
  it('calls requestBlob with correct arguments when processed is undefined', async () => {
    mockLocationData = { query: { category: 'category' } };
    render(<Export />);
    fireEvent.click(screen.getByRole('button'));

    expect(requestBlob).toHaveBeenCalledWith(apiPath, application, {
      category: 'category',
    });
  });
});
