import React from 'react';
import ReportBuilderPage from '.';
import { render, screen, fireEvent, userEvent } from 'utils/testUtils/rtl';
import { createReport } from 'services/reports';

jest.mock('services/appConfiguration');
jest.mock('services/locale');

// hook mocks
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

let mockReports;
jest.mock('hooks/useReports', () => jest.fn(() => mockReports));
jest.mock('services/reports', () => ({ createReport: jest.fn() }));

// mock data
const reports = [
  {
    attributes: {
      name: 'report 1',
      created_at: '20-12-2022',
      updated_at: '20-12-2022',
    },
  },
  {
    attributes: {
      name: 'report 2',
      created_at: '20-12-2022',
      updated_at: '20-12-2022',
    },
  },
];

describe('<ReportBuilderPage />', () => {
  describe('empty state', () => {
    it('renders if reports is empty array', () => {
      mockReports = [];
      render(<ReportBuilderPage />);

      expect(
        screen.getByText('Create your first project report')
      ).toBeInTheDocument();
    });

    it('opens modal if button is clicked', () => {
      mockReports = [];
      render(<ReportBuilderPage />);
      expect(screen.queryByText('Report title')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Create a report'));
      expect(screen.getByText('Report title')).toBeInTheDocument();
    });

    it('creates a report', async () => {
      const user = userEvent.setup();
      mockReports = [];
      const { container } = render(<ReportBuilderPage />);
      fireEvent.click(screen.getByText('Create a report'));

      const input = container.querySelector('input[type=text]');
      await user.type(input, 'Test project');
      expect(input).toHaveValue('Test project');

      fireEvent.click(screen.getByTestId('create-report-button'));
      expect(createReport).toHaveBeenCalledTimes(1);
      expect(createReport).toHaveBeenCalledWith('Test project');
    });
  });

  describe('with reports', () => {
    it('does not render empty state', () => {
      mockReports = reports;
      render(<ReportBuilderPage />);

      expect(
        screen.queryByText('Create your first project report')
      ).not.toBeInTheDocument();
    });

    // it('renders reports', () => {
    //   mockReports = reports;

    // });

    // it('calls clHistory.push with correct arg when clicking "edit"', () => {

    // })

    // it('calls clHistory.push with correct arg when clicking "view"', () => {

    // });
  });
});
