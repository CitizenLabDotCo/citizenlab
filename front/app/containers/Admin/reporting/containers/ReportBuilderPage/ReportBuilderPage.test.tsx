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
});
