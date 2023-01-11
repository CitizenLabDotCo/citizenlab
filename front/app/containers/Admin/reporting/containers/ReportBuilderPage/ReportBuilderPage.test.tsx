import React from 'react';
import ReportBuilderPage from '.';
import { render, screen, fireEvent, userEvent, act } from 'utils/testUtils/rtl';
import { createReport, deleteReport } from 'services/reports';
import clHistory from 'utils/cl-router/history';

// service mocks
jest.mock('services/appConfiguration');
jest.mock('services/locale');

// hook mocks
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

let mockReports;
jest.mock('hooks/useReports', () => jest.fn(() => mockReports));
jest.mock('services/reports', () => ({
  createReport: jest.fn(),
  deleteReport: jest.fn(),
}));

const mockUser1 = { attributes: { first_name: 'User 1' } };
const mockUser2 = { attributes: { first_name: 'User 2' } };
jest.mock('hooks/useUser', () =>
  jest.fn(({ userId }) => (userId === '_1' ? mockUser1 : mockUser2))
);

const reports = [
  {
    id: 'r1',
    attributes: {
      name: 'Report 1',
      created_at: '2022-12-18',
      updated_at: '2022-12-19',
    },
    relationships: {
      owner: {
        data: {
          id: '_1',
        },
      },
    },
  },
  {
    id: 'r2',
    attributes: {
      name: 'Report 2',
      created_at: '2022-12-20',
      updated_at: '2022-12-21',
    },
    relationships: {
      owner: {
        data: {
          id: '_2',
        },
      },
    },
  },
];

// other mocks
global.window.confirm = jest.fn(() => true);
jest.mock('utils/cl-router/history');

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
      await act(() => user.type(input, 'Test project'));
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

    it('renders reports', () => {
      mockReports = reports;
      render(<ReportBuilderPage />);

      expect(screen.getByText('Report 1')).toBeInTheDocument();
      expect(screen.getByText('Report 2')).toBeInTheDocument();
    });

    it('deletes report', async () => {
      mockReports = reports;
      render(<ReportBuilderPage />);
      const deleteButtonSecondReport = screen.getAllByText('Delete')[1];
      fireEvent.click(deleteButtonSecondReport);

      expect(global.window.confirm).toHaveBeenCalledTimes(1);
      expect(deleteReport).toHaveBeenCalledWith('r2');
    });

    it('calls clHistory.push with correct arg when clicking "edit"', () => {
      mockReports = reports;
      render(<ReportBuilderPage />);
      const editButtonSecondReport = screen.getAllByText('Edit')[1];
      fireEvent.click(editButtonSecondReport);

      expect(clHistory.push).toHaveBeenCalledWith(
        '/admin/reporting/report-builder/r2/editor'
      );
    });

    it('calls clHistory.push with correct arg when clicking "view"', () => {
      mockReports = reports;
      render(<ReportBuilderPage />);
      const viewButtonSecondReport = screen.getAllByText('View')[1];
      fireEvent.click(viewButtonSecondReport);

      expect(clHistory.push).toHaveBeenCalledWith(
        '/admin/reporting/report-builder/r2/viewer'
      );
    });
  });
});
