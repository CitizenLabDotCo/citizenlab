import React from 'react';
import ReportBuilderPage from '.';
import { render, screen, fireEvent, userEvent, act } from 'utils/testUtils/rtl';

import clHistory from 'utils/cl-router/history';

// hook mocks
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

let mockReports;
jest.mock('api/reports/useReports', () =>
  jest.fn(() => ({ data: { data: mockReports } }))
);

const mockCreateReport = jest.fn();

jest.mock('api/reports/useAddReport', () =>
  jest.fn(() => ({ mutate: mockCreateReport }))
);

const mockDeleteReport = jest.fn();

jest.mock('api/reports/useDeleteReport', () =>
  jest.fn(() => ({ mutate: mockDeleteReport }))
);

const mockUser1 = { attributes: { first_name: 'User 1' } };
const mockUser2 = { attributes: { first_name: 'User 2' } };
jest.mock('api/users/useUserById', () =>
  jest.fn((userId) =>
    userId === '_1'
      ? { data: { data: mockUser1 } }
      : { data: { data: mockUser2 } }
  )
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

const mockOpen = jest.fn();
global.window.open = mockOpen;

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
      expect(mockCreateReport).toHaveBeenCalledTimes(1);
      expect(mockCreateReport).toHaveBeenCalledWith(
        { name: 'Test project' },
        expect.anything()
      );
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
      expect(mockDeleteReport).toHaveBeenCalledWith('r2');
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

    it('calls window.open with correct args when clicking "view"', () => {
      mockReports = reports;
      render(<ReportBuilderPage />);
      const viewButtonSecondReport = screen.getAllByText('View')[1];
      fireEvent.click(viewButtonSecondReport);

      expect(mockOpen).toHaveBeenCalledWith(
        '/admin/reporting/report-builder/r2/viewer',
        '_blank'
      );
    });
  });
});
